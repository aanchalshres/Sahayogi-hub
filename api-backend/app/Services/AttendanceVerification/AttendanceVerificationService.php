<?php

namespace App\Services\AttendanceVerification;

use App\Events\TrustScore\AttendanceRecorded;
use App\Models\ServiceLog;
use App\Models\Task;
use App\Models\VolunteerProfile;
use App\Services\AttendanceVerification\Contracts\AttendanceVerificationServiceInterface;
use App\Services\AttendanceVerification\Contracts\GpsValidationServiceInterface;
use App\Services\AttendanceVerification\Contracts\TimeValidationServiceInterface;
use App\Services\AttendanceVerification\Contracts\AttendanceConfidenceServiceInterface;
use App\Jobs\AttendanceAuditLogJob;
use App\Jobs\UpdateAttendanceAnalyticsJob;
use App\Jobs\UpdateAttendanceTrustScoreJob;
use Illuminate\Support\Facades\DB;

class AttendanceVerificationService implements AttendanceVerificationServiceInterface
{
    public function __construct(
        private GpsValidationServiceInterface $gpsService,
        private TimeValidationServiceInterface $timeService,
        private AttendanceConfidenceServiceInterface $confidenceService,
    ) {}

    /**
     * Mark GPS-verified attendance for a volunteer at a task.
     *
     * Rules enforced here:
     *  1. Volunteer must be assigned (Accepted application).
     *  2. Task must be active (status = 'Open').
     *  3. Attendance must not already be recorded for this task.
     *  4. Task must have valid coordinates.
     *  5. Volunteer must be within the configured radius.
     *
     * This records PRESENCE ONLY. It does NOT complete the task or award hours.
     * Task completion is handled separately by the NGO.
     */
    public function markAttendance(
        VolunteerProfile $volunteer,
        Task $task,
        array $gpsData,
        ?array $deviceInfo = null
    ): ServiceLog {
        // --- 1. Task must be active ---
        if ($task->status !== 'Open') {
            abort(422, 'This task is not currently active.');
        }

        // --- 2. Volunteer must be assigned ---
        $application = $volunteer->applications()
            ->where('task_id', $task->id)
            ->where('status', 'Accepted')
            ->first();

        if (!$application) {
            abort(403, 'You are not assigned to this task.');
        }

        // --- 3. Attendance must not already be recorded ---
        $existing = ServiceLog::where('volunteer_profile_id', $volunteer->id)
            ->where('task_id', $task->id)
            ->whereIn('participation_status', ['active', 'completed'])
            ->first();

        if ($existing) {
            abort(422, 'Attendance has already been recorded for this task.');
        }

        // --- 4. Task must have valid coordinates (hard block — no bypass) ---
        $taskLat = $task->latitude ? (float) $task->latitude : null;
        $taskLng = $task->longitude ? (float) $task->longitude : null;

        if ($taskLat === null || $taskLng === null) {
            abort(422, 'This task does not have a valid location configured. Please contact the NGO.');
        }

        // --- 5. GPS validation (uses HaversineDistance internally) ---
        $gpsValidation = $this->gpsService->validate(
            $gpsData['latitude'] ?? 0,
            $gpsData['longitude'] ?? 0,
            $gpsData['accuracy'] ?? 999,
            $task
        );

        if (!$gpsValidation['valid']) {
            $errors = $gpsValidation['errors'] ?? ['GPS validation failed.'];
            abort(422, $errors[0]);
        }

        // --- Time validation (soft — scores the confidence but does not block) ---
        $timeValidation = $this->timeService->validateCheckIn(
            now(),
            $task->start_date,
            $task->end_date
        );

        // --- Confidence score (GPS-only weights: gps 0.50, time 0.35, device 0.15) ---
        $confidence = $this->confidenceService->calculate([
            'gps_accuracy'       => $gpsValidation['score'] ?? 0,
            'time_validity'      => $timeValidation['score'] ?? 0,
            'device_consistency' => $deviceInfo ? 80 : 50,
        ]);

        // --- Persist the attendance record ---
        $log = DB::transaction(function () use ($volunteer, $task, $gpsData, $gpsValidation, $confidence, $deviceInfo) {
            return ServiceLog::create([
                'volunteer_profile_id'       => $volunteer->id,
                'task_id'                    => $task->id,
                'check_in_time'              => now(),
                'participation_status'       => 'active',   // presence only — not completed
                'verification_method'        => 'gps',
                'check_in_latitude'          => $gpsData['latitude'] ?? null,
                'check_in_longitude'         => $gpsData['longitude'] ?? null,
                'check_in_gps_accuracy'      => $gpsData['accuracy'] ?? null,
                'check_in_distance_from_task'=> $gpsValidation['distance'] ?? null,
                'attendance_confidence_score'=> $confidence['score'],
                'confidence_level'           => $confidence['level'],
                'device_info'                => $deviceInfo,
                // qr_token and qr_expires_at intentionally omitted (nullable columns)
            ]);
        });

        AttendanceRecorded::dispatch($volunteer->id, 'check_in', $confidence['score']);
        $this->dispatchBackgroundJobs($log, 'check_in');

        return $log;
    }

    /**
     * Legacy check-out: closes an active service log when the NGO has confirmed
     * the volunteer's work session. Task completion is NOT triggered here;
     * that remains the NGO's responsibility via their own workflow.
     */
    public function checkOut(
        ServiceLog $log,
        array $gpsData,
        ?array $deviceInfo = null
    ): ServiceLog {
        $task = $log->task;

        if ($log->participation_status !== 'active') {
            abort(422, 'You are not currently checked in.');
        }

        if ($log->check_out_time) {
            abort(422, 'Check-out already recorded.');
        }

        $gpsValidation = $this->gpsService->validate(
            $gpsData['latitude'] ?? 0,
            $gpsData['longitude'] ?? 0,
            $gpsData['accuracy'] ?? 999,
            $task
        );

        $timeValidation = $this->timeService->validateCheckOut(
            $log->check_in_time,
            now()
        );

        $confidenceIn  = $log->attendance_confidence_score ?? 50;
        $confidenceOut = $this->confidenceService->calculate([
            'gps_accuracy'       => $gpsValidation['score'] ?? 0,
            'time_validity'      => $timeValidation['score'] ?? 0,
            'device_consistency' => $deviceInfo ? 80 : 50,
        ]);

        $overallConfidence = round(($confidenceIn + $confidenceOut['score']) / 2, 1);

        $log = DB::transaction(function () use ($log, $gpsData, $gpsValidation, $overallConfidence, $deviceInfo) {
            $checkIn  = \Carbon\Carbon::parse($log->check_in_time);
            $checkOut = now();
            $hours    = round($checkIn->diffInMinutes($checkOut) / 60, 2);

            $log->update([
                'check_out_time'              => $checkOut,
                'hours'                       => $hours,
                // NOTE: status remains 'active' until the NGO marks the task complete.
                // Changing to 'completed' here would bypass the NGO approval workflow.
                'check_out_latitude'          => $gpsData['latitude'] ?? null,
                'check_out_longitude'         => $gpsData['longitude'] ?? null,
                'check_out_gps_accuracy'      => $gpsData['accuracy'] ?? null,
                'check_out_distance_from_task'=> $gpsValidation['distance'] ?? null,
                'attendance_confidence_score' => $overallConfidence,
                'confidence_level'            => $this->confidenceService->classify($overallConfidence),
                'device_info'                 => $deviceInfo
                    ? array_merge($log->device_info ?? [], $deviceInfo)
                    : $log->device_info,
            ]);

            return $log->fresh();
        });

        AttendanceRecorded::dispatch($log->volunteer_profile_id, 'check_out', $overallConfidence);
        $this->dispatchBackgroundJobs($log, 'check_out');

        return $log;
    }

    private function dispatchBackgroundJobs(ServiceLog $log, string $action): void
    {
        $config = config('attendance-verification.jobs', []);

        if ($config['audit_log'] ?? true) {
            AttendanceAuditLogJob::dispatch($log->id, $action);
        }

        if ($config['analytics_update'] ?? true) {
            UpdateAttendanceAnalyticsJob::dispatch($log->id, $action);
        }

        if ($config['trust_score_update'] ?? true) {
            UpdateAttendanceTrustScoreJob::dispatch($log->volunteer_profile_id, $action);
        }
    }
}
