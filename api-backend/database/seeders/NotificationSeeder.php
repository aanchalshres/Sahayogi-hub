<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\Application;
use App\Models\NgoProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $applications = Application::with(['task.ngo', 'volunteer.user'])->get();
        $ngos = NgoProfile::with('user')->get();

        if ($applications->isEmpty() || $ngos->isEmpty()) {
            $this->command?->error('Applications or NGOs missing. Run previous seeders first.');
            return;
        }

        $notifCount = 0;

        // 1. Seed notifications for applications
        foreach ($applications as $app) {
            $task = $app->task;
            $volUser = $app->volunteer?->user;
            if (!$task || !$task->ngo || !$volUser) continue;

            $ngoUser = User::find($task->ngo->user_id);
            if (!$ngoUser) continue;

            $ngoName = $task->ngo->organization_name;

            switch ($app->status) {
                case 'Pending':
                    Notification::firstOrCreate(
                        [
                            'user_id' => $ngoUser->id,
                            'type'    => 'volunteer_applied',
                            'title'   => 'New Application',
                            'message' => "{$volUser->name} applied for {$task->title}",
                        ],
                        [
                            'is_read' => false,
                            'created_at' => $app->applied_at,
                        ]
                    );
                    $notifCount++;
                    break;

                case 'Accepted':
                    Notification::firstOrCreate(
                        [
                            'user_id' => $volUser->id,
                            'type'    => 'application_accepted',
                            'title'   => 'Application Accepted',
                            'message' => "Your application for {$task->title} at {$ngoName} has been accepted",
                        ],
                        [
                            'is_read' => true,
                            'read_at' => now()->subDays(1),
                            'created_at' => $app->reviewed_at ?? now(),
                        ]
                    );
                    $notifCount++;
                    break;

                case 'Rejected':
                    Notification::firstOrCreate(
                        [
                            'user_id' => $volUser->id,
                            'type'    => 'application_rejected',
                            'title'   => 'Application Rejected',
                            'message' => "Your application for {$task->title} at {$ngoName} has been rejected",
                        ],
                        [
                            'is_read' => true,
                            'read_at' => now()->subDays(2),
                            'created_at' => $app->reviewed_at ?? now(),
                        ]
                    );
                    $notifCount++;
                    break;

                case 'Withdrawn':
                    Notification::firstOrCreate(
                        [
                            'user_id' => $ngoUser->id,
                            'type'    => 'volunteer_withdrawn',
                            'title'   => 'Application Withdrawn',
                            'message' => "{$volUser->name} withdrew application for {$task->title}",
                        ],
                        [
                            'is_read' => false,
                            'created_at' => now()->subDays(1),
                        ]
                    );
                    $notifCount++;
                    break;
            }
        }

        // 2. Seed organization verification & reminder notifications for NGOs
        foreach ($ngos as $ngo) {
            $ngoUser = User::find($ngo->user_id);
            if (!$ngoUser) continue;

            if ($ngo->verification_status === 'verified') {
                Notification::firstOrCreate(
                    [
                        'user_id' => $ngoUser->id,
                        'type'    => 'verification_approved',
                        'title'   => 'Verification Approved',
                        'message' => 'Your organization has been verified. You can now post opportunities.',
                    ],
                    [
                        'is_read' => true,
                        'read_at' => now()->subDays(10),
                    ]
                );
                $notifCount++;
            }

            // Upcoming reminder notification
            $task = $ngo->tasks->first();
            if ($task && $task->start_date) {
                Notification::firstOrCreate(
                    [
                        'user_id' => $ngoUser->id,
                        'type'    => 'upcoming_reminder',
                        'title'   => 'Upcoming Opportunity Reminder',
                        'message' => "{$task->title} starts on {$task->start_date}",
                    ],
                    [
                        'is_read' => false,
                    ]
                );
                $notifCount++;
            }
        }

        $this->command?->info("NotificationSeeder executed successfully: {$notifCount} system notifications seeded across all supported NotificationService types.");
    }
}
