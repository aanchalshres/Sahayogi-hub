<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\Task;
use App\Models\VolunteerProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class ApplicationSeeder extends Seeder
{
    public function run(): void
    {
        $tasks = Task::with('ngo')->whereNotIn('slug', [
            'test-matching-emergency-response-task',
            'ranking-validation-medical-task',
        ])->get();

        $volunteers = VolunteerProfile::whereHas('user', function ($q) {
            $q->where('email', 'not like', 'testvol%')
              ->where('email', 'not like', 'rank%');
        })->get();

        if ($tasks->isEmpty() || $volunteers->isEmpty()) {
            $this->command?->error('Tasks or Volunteers missing. Run TaskSeeder and VolunteerProfileSeeder first.');
            return;
        }

        $statuses = [
            'Accepted'    => 14,
            'Pending'     => 10,
            'Rejected'    => 8,
            'Withdrawn'   => 4,
            'Cancelled'   => 2,
            'Shortlisted' => 2,
        ];

        $rejectionRemarks = [
            'Qualifications do not meet minimum emergency criteria.',
            'Quota reached for this location segment.',
            'Schedule overlap with previously assigned NGO activity.',
            'Verification requirements incomplete at application deadline.',
        ];

        $appCount = 0;
        $volunteerIndex = 0;

        foreach ($tasks as $task) {
            $ngoUser = User::find($task->ngo->user_id);
            // Select 2-4 volunteers per task
            $volCount = min(3, $volunteers->count());

            for ($i = 0; $i < $volCount; $i++) {
                $vol = $volunteers->get(($volunteerIndex++) % $volunteers->count());

                // Pick status deterministically
                $statusKey = array_keys($statuses)[$appCount % count($statuses)];

                $appliedAt = now()->subDays(rand(5, 20));
                $reviewedAt = in_array($statusKey, ['Accepted', 'Rejected', 'Cancelled', 'Shortlisted'])
                    ? (clone $appliedAt)->addDays(rand(1, 3))
                    : null;
                $reviewedBy = $reviewedAt ? $task->ngo->user_id : null;
                $remarks = ($statusKey === 'Rejected')
                    ? $rejectionRemarks[$appCount % count($rejectionRemarks)]
                    : (($statusKey === 'Accepted') ? 'Application approved based on skill match.' : null);

                Application::updateOrCreate(
                    [
                        'task_id'              => $task->id,
                        'volunteer_profile_id' => $vol->id,
                    ],
                    [
                        'recommendation_score' => round(rand(60, 95) / 100, 2),
                        'status'               => $statusKey,
                        'applied_at'           => $appliedAt,
                        'reviewed_by'          => $reviewedBy,
                        'reviewed_at'          => $reviewedAt,
                        'remarks'              => $remarks,
                    ]
                );

                $appCount++;
            }
        }

        $this->command?->info("ApplicationSeeder executed successfully: {$appCount} applications seeded covering all 6 application statuses.");
    }
}
