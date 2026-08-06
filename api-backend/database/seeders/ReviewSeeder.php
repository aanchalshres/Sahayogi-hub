<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\ServiceLog;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        // Fetch completed service logs with task (and NGO) and volunteer profile (and User)
        $completedLogs = ServiceLog::with(['task.ngo', 'volunteer.user'])
            ->where('participation_status', 'completed')
            ->get();

        if ($completedLogs->isEmpty()) {
            $this->command?->error('No completed service logs found. Run ServiceLogSeeder first.');
            return;
        }

        $ratings = [5, 4, 5, 4, 3, 5, 4, 2, 5, 1];
        $ngoComments = [
            5 => 'Exceptional commitment, arrived early, and showed extraordinary leadership during the drive.',
            4 => 'Very reliable and proactive. Completed all assigned tasks with minimal supervision.',
            3 => 'Good overall performance, though check-in was slightly delayed.',
            2 => 'Lacked enthusiasm and required continuous monitoring to complete assigned tasks.',
            1 => 'Unresponsive to team lead instructions and left duty station before formal checkout.',
        ];

        $volunteerComments = [
            5 => 'Incredible organization by the NGO! Clear instructions and well-managed logistics.',
            4 => 'Great experience volunteering with this team. Would love to join future campaigns.',
            3 => 'Decent coordination, though food and water arrangements could be improved.',
            2 => 'Lack of clear task delegation on site led to considerable confusion.',
            1 => 'Disorganized event management and poor communication from field officers.',
        ];

        $reviewCount = 0;
        $index = 0;

        foreach ($completedLogs as $log) {
            $task = $log->task;
            $volUser = $log->volunteer?->user;

            if (!$task || !$task->ngo || !$volUser) continue;

            $ngoUser = $task->ngo->user_id;

            $rating = $ratings[($index++) % count($ratings)];

            // 1. NGO reviews Volunteer
            Review::updateOrCreate(
                [
                    'reviewer_id' => $ngoUser,
                    'reviewee_id' => $volUser->id,
                    'task_id'     => $task->id,
                ],
                [
                    'rating'  => $rating,
                    'comment' => $ngoComments[$rating] ?? 'Satisfactory work.',
                ]
            );
            $reviewCount++;

            // 2. Volunteer reviews NGO (bidirectional)
            // Pick slightly different or matching rating
            $volRating = max(1, min(5, $rating + rand(-1, 0)));
            Review::updateOrCreate(
                [
                    'reviewer_id' => $volUser->id,
                    'reviewee_id' => $ngoUser,
                    'task_id'     => $task->id,
                ],
                [
                    'rating'  => $volRating,
                    'comment' => $volunteerComments[$volRating] ?? 'Good organization.',
                ]
            );
            $reviewCount++;
        }

        $this->command?->info("ReviewSeeder executed successfully: {$reviewCount} bidirectional reviews seeded.");
    }
}
