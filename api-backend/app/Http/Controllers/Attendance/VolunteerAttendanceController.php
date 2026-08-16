<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Models\ServiceLog;
use App\Models\Task;
use App\Services\AttendanceVerification\Contracts\AttendanceVerificationServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VolunteerAttendanceController extends Controller
{
    public function __construct(
        private AttendanceVerificationServiceInterface $verificationService
    ) {}

    // -------------------------------------------------------------------------

    public function markAttendance(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'task_id'      => 'required|integer|exists:tasks,id',
            'latitude'     => 'required|numeric|between:-90,90',
            'longitude'    => 'required|numeric|between:-180,180',
            'gps_accuracy' => 'required|numeric|min:0|max:9999',
            'device_info'  => 'nullable|array',
            'device_info.user_agent' => 'nullable|string',
            'device_info.platform'   => 'nullable|string',
        ]);

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can mark attendance.'], 403);
        }

        $profile = $user->volunteerProfile;
        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found.'], 404);
        }

        $task = Task::findOrFail($validated['task_id']);

        try {
            $log = $this->verificationService->markAttendance(
                $profile,
                $task,
                [
                    'latitude'  => $validated['latitude'],
                    'longitude' => $validated['longitude'],
                    'accuracy'  => $validated['gps_accuracy'],
                ],
                $validated['device_info'] ?? null
            );

            return response()->json([
                'message' => 'Attendance marked successfully.',
                'data'    => $this->formatLog($log),
            ], 201);
        } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage() ?: 'Failed to mark attendance.'], 422);
        }
    }

    // -------------------------------------------------------------------------
    // Check-In (GPS-only, kept for backwards compatibility with existing logs)
    // Internally delegates to markAttendance logic.
    // -------------------------------------------------------------------------

    public function checkIn(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'task_id'      => 'required|integer|exists:tasks,id',
            'latitude'     => 'required|numeric|between:-90,90',
            'longitude'    => 'required|numeric|between:-180,180',
            'gps_accuracy' => 'required|numeric|min:0|max:9999',
            'device_info'  => 'nullable|array',
            'device_info.user_agent' => 'nullable|string',
            'device_info.platform'   => 'nullable|string',
        ]);

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can check in.'], 403);
        }

        $profile = $user->volunteerProfile;
        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found.'], 404);
        }

        $task = Task::findOrFail($validated['task_id']);

        try {
            $log = $this->verificationService->markAttendance(
                $profile,
                $task,
                [
                    'latitude'  => $validated['latitude'],
                    'longitude' => $validated['longitude'],
                    'accuracy'  => $validated['gps_accuracy'],
                ],
                $validated['device_info'] ?? null
            );

            return response()->json([
                'message' => 'Check-in successful.',
                'data'    => $this->formatLog($log),
            ], 201);
        } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage() ?: 'Check-in failed.'], 422);
        }
    }

    // -------------------------------------------------------------------------
    // Check-Out (GPS-only, closes the session; does NOT mark task as complete)
    // -------------------------------------------------------------------------

    public function checkOut(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'latitude'     => 'required|numeric|between:-90,90',
            'longitude'    => 'required|numeric|between:-180,180',
            'gps_accuracy' => 'required|numeric|min:0|max:9999',
            'device_info'  => 'nullable|array',
            'device_info.user_agent' => 'nullable|string',
            'device_info.platform'   => 'nullable|string',
        ]);

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can check out.'], 403);
        }

        $profile = $user->volunteerProfile;
        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found.'], 404);
        }

        $activeLog = ServiceLog::where('volunteer_profile_id', $profile->id)
            ->where('participation_status', 'active')
            ->whereNotNull('check_in_time')
            ->whereNull('check_out_time')
            ->latest()
            ->first();

        if (!$activeLog) {
            return response()->json(['message' => 'No active check-in found.'], 422);
        }

        try {
            $log = $this->verificationService->checkOut(
                $activeLog,
                [
                    'latitude'  => $validated['latitude'],
                    'longitude' => $validated['longitude'],
                    'accuracy'  => $validated['gps_accuracy'],
                ],
                $validated['device_info'] ?? null
            );

            return response()->json([
                'message' => 'Check-out successful.',
                'data'    => $this->formatLog($log),
            ]);
        } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage() ?: 'Check-out failed.'], 422);
        }
    }

    // -------------------------------------------------------------------------
    // Status, History, Analytics (unchanged)
    // -------------------------------------------------------------------------

    public function status(Request $request): JsonResponse
    {
        $user    = $request->user();
        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found.'], 404);
        }

        $activeLog = ServiceLog::with(['task'])
            ->where('volunteer_profile_id', $profile->id)
            ->where('participation_status', 'active')
            ->whereNotNull('check_in_time')
            ->whereNull('check_out_time')
            ->latest()
            ->first();

        if (!$activeLog) {
            return response()->json([
                'checked_in' => false,
                'message'    => 'Not currently checked in.',
            ]);
        }

        return response()->json([
            'checked_in' => true,
            'data'       => [
                'id'               => $activeLog->id,
                'task_id'          => $activeLog->task_id,
                'task_title'       => $activeLog->task?->title,
                'task_ngo'         => $activeLog->task?->ngo?->organization_name,
                'check_in_time'    => $activeLog->check_in_time,
                'elapsed_minutes'  => $activeLog->check_in_time?->diffInMinutes(now()),
                'confidence_score' => $activeLog->attendance_confidence_score,
                'confidence_level' => $activeLog->confidence_level,
            ],
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $user    = $request->user();
        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found.'], 404);
        }

        $logs = ServiceLog::with(['task.ngo'])
            ->where('volunteer_profile_id', $profile->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $logs->map(fn($l) => $this->formatLog($l)),
        ]);
    }

    public function analytics(Request $request): JsonResponse
    {
        $user    = $request->user();
        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found.'], 404);
        }

        $logs = ServiceLog::where('volunteer_profile_id', $profile->id);

        return response()->json([
            'data' => [
                'total_sessions'          => $logs->count(),
                'total_hours'             => round($logs->where('participation_status', 'completed')->sum('hours'), 2),
                'completed_sessions'      => $logs->where('participation_status', 'completed')->count(),
                'active_sessions'         => $logs->where('participation_status', 'active')->count(),
                'absent_sessions'         => $logs->where('participation_status', 'absent')->count(),
                'average_confidence'      => $logs->whereNotNull('attendance_confidence_score')->avg('attendance_confidence_score')
                    ? round($logs->whereNotNull('attendance_confidence_score')->avg('attendance_confidence_score'), 1)
                    : null,
                'high_confidence_sessions'=> $logs->where('confidence_level', 'high')->count(),
            ],
        ]);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private function formatLog(ServiceLog $log): array
    {
        return [
            'id'                  => $log->id,
            'task_id'             => $log->task_id,
            'task_title'          => $log->task?->title,
            'task_ngo'            => $log->task?->ngo?->organization_name,
            'status'              => $log->participation_status,
            'check_in_time'       => $log->check_in_time,
            'check_out_time'      => $log->check_out_time,
            'hours'               => $log->hours,
            'verification_method' => $log->verification_method,
            'confidence_score'    => $log->attendance_confidence_score,
            'confidence_level'    => $log->confidence_level,
            'check_in_distance'   => $log->check_in_distance_from_task,
            'check_out_distance'  => $log->check_out_distance_from_task,
            'check_in_latitude'   => $log->check_in_latitude,
            'check_in_longitude'  => $log->check_in_longitude,
            'created_at'          => $log->created_at,
        ];
    }
}
