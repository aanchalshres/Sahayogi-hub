<?php

namespace Database\Seeders;

use App\Models\ServiceLog;
use App\Models\Application;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ServiceLogSeeder extends Seeder
{
    public function run(): void
    {
        // Fetch accepted applications with tasks and volunteers
        $acceptedApplications = Application::with(['task', 'volunteer'])
            ->where('status', 'Accepted')
            ->get();

        if ($acceptedApplications->isEmpty()) {
            $this->command?->error('No Accepted applications found. Run ApplicationSeeder first.');
            return;
        }

        $logCount = 0;
        $statuses = ['completed', 'completed', 'completed', 'active', 'absent', 'assigned'];
        $index = 0;

        foreach ($acceptedApplications as $app) {
            $task = $app->task;
            $vol = $app->volunteer;

            if (!$task || !$vol) continue;

            $status = $statuses[($index++) % count($statuses)];

            $checkIn = null;
            $checkOut = null;
            $hours = 0.00;
            $feedback = null;
            $checkInLat = null;
            $checkInLng = null;
            $checkOutLat = null;
            $checkOutLng = null;
            $confidenceScore = null;
            $confidenceLevel = null;
            $method = null;

            if ($status === 'completed') {
                $baseTime = $task->start_date ? Carbon::parse($task->start_date) : now()->subDays(5);
                $lateMinutes = ($index % 7 === 0) ? 25 : rand(0, 10);
                $checkIn = (clone $baseTime)->addMinutes($lateMinutes);
                $durationHours = rand(3, 8);
                $checkOut = (clone $checkIn)->addHours($durationHours);
                $hours = (float)$durationHours;

                $feedback = 'Great volunteer participation. Task completed efficiently with high dedication.';
                $method = 'qr_gps';
                $checkInLat = $task->latitude ? (float)$task->latitude + (rand(-10, 10) / 10000) : 27.7172;
                $checkInLng = $task->longitude ? (float)$task->longitude + (rand(-10, 10) / 10000) : 85.3240;
                $checkOutLat = $checkInLat;
                $checkOutLng = $checkInLng;
                $confidenceScore = 0.95;
                $confidenceLevel = 'high';
            } elseif ($status === 'active') {
                $checkIn = now()->subHours(2);
                $hours = 0.00;
                $method = 'qr_gps';
                $checkInLat = $task->latitude ? (float)$task->latitude : 27.7172;
                $checkInLng = $task->longitude ? (float)$task->longitude : 85.3240;
                $confidenceScore = 0.90;
                $confidenceLevel = 'high';
            } elseif ($status === 'absent') {
                $feedback = 'Volunteer failed to report to assigned duty station without prior notice.';
            } else { // assigned
            }

            ServiceLog::updateOrCreate(
                [
                    'volunteer_profile_id' => $vol->id,
                    'task_id'              => $task->id,
                ],
                [
                    'check_in_time'               => $checkIn,
                    'check_out_time'              => $checkOut,
                    'hours'                       => $hours,
                    'participation_status'        => $status,
                    'feedback'                    => $feedback,
                    'verification_method'         => $method,
                    'check_in_latitude'           => $checkInLat,
                    'check_in_longitude'          => $checkInLng,
                    'check_out_latitude'          => $checkOutLat,
                    'check_out_longitude'         => $checkOutLng,
                    'attendance_confidence_score' => $confidenceScore,
                    'confidence_level'            => $confidenceLevel,
                ]
            );

            $logCount++;
        }

        $this->command?->info("ServiceLogSeeder executed successfully: {$logCount} service logs seeded across completed, active, absent, and assigned statuses.");
    }
}
