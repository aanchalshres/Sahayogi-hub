<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\VolunteerProfile;
use App\Models\NgoProfile;
use App\Models\Task;
use App\Models\Category;
use App\Models\Skill;
use App\Models\Application;
use App\Models\ServiceLog;
use App\Models\Review;
use App\Models\Certificate;
use App\Models\CertificateAuthentication;
use App\Models\TrustScoreHistory;
use App\Models\Notification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class WorkflowScenarioSeeder extends Seeder
{
    public function run(): void
    {
        $ngo = NgoProfile::first();
        $category = Category::first();
        $skills = Skill::pluck('id', 'name');

        if (!$ngo || !$category) {
            $this->command?->error('NGO or Category missing.');
            return;
        }

        // SCENARIO 1: Full Successful Completion
        $this->seedScenario1($ngo, $category, $skills);

        // SCENARIO 2: Mixed Attendance & Penalties
        $this->seedScenario2($ngo, $category, $skills);

        // SCENARIO 3: Withdrawals & Cancellations
        $this->seedScenario3($ngo, $category, $skills);

        $this->command?->info('WorkflowScenarioSeeder executed successfully: All 3 end-to-end scenarios seeded.');
    }

    private function seedScenario1($ngo, $category, $skills): void
    {
        // 1. Task
        $task = Task::updateOrCreate(
            ['slug' => 'scenario-1-disaster-relief-workshop'],
            [
                'ngo_id'               => $ngo->id,
                'category_id'          => $category->id,
                'title'                => 'Scenario 1: Disaster Relief Workshop',
                'description'          => 'End-to-end successful disaster relief volunteer training workshop.',
                'task_type'            => 'Event',
                'selection_logic'      => 'recommendation',
                'location'             => 'City Hall, Kathmandu',
                'city'                 => 'Kathmandu',
                'country'              => 'Nepal',
                'latitude'             => 27.7172,
                'longitude'            => 85.3240,
                'required_volunteers'  => 3,
                'start_date'           => now()->subDays(10),
                'end_date'             => now()->subDays(9),
                'application_deadline' => now()->subDays(12),
                'status'               => 'Completed',
                'urgency_level'        => 'High',
                'created_by'           => $ngo->user_id,
            ]
        );

        if (isset($skills['First Aid'])) {
            $task->skills()->sync([$skills['First Aid']]);
        }

        // 2. Volunteers (4 created)
        $sc1Volunteers = [];
        for ($i = 1; $i <= 4; $i++) {
            $u = User::firstOrCreate(
                ['email' => "sc1.vol{$i}@example.com"],
                [
                    'name'     => "Scenario 1 Vol {$i}",
                    'phone'    => "982000000{$i}",
                    'password' => Hash::make('password'),
                    'role'     => 'volunteer',
                    'is_active'=> true,
                ]
            );
            $p = VolunteerProfile::updateOrCreate(
                ['user_id' => $u->id],
                [
                    'bio'                 => 'Scenario 1 Test Volunteer',
                    'city'                => 'Kathmandu',
                    'country'             => 'Nepal',
                    'latitude'            => 27.7172,
                    'longitude'           => 85.3240,
                    'availability'        => 'Available',
                    'is_profile_complete' => true,
                    'trust_score'         => 0.85 + ($i * 0.02),
                ]
            );
            $sc1Volunteers[] = ['user' => $u, 'profile' => $p];
        }

        // 3. Applications: Accept 3, Reject 1
        for ($i = 0; $i < 4; $i++) {
            $vol = $sc1Volunteers[$i];
            $status = ($i < 3) ? 'Accepted' : 'Rejected';

            // Application
            $app = Application::updateOrCreate(
                [
                    'task_id'              => $task->id,
                    'volunteer_profile_id' => $vol['profile']->id,
                ],
                [
                    'recommendation_score' => 0.90 - ($i * 0.05),
                    'status'               => $status,
                    'applied_at'           => now()->subDays(14),
                    'reviewed_by'          => $ngo->user_id,
                    'reviewed_at'          => now()->subDays(11),
                    'remarks'              => ($status === 'Accepted') ? 'Approved' : 'Quota full',
                ]
            );

            // 4. Attendance & ServiceLog for 3 accepted
            if ($status === 'Accepted') {
                ServiceLog::updateOrCreate(
                    [
                        'volunteer_profile_id' => $vol['profile']->id,
                        'task_id'              => $task->id,
                    ],
                    [
                        'check_in_time'               => now()->subDays(10)->addHour(),
                        'check_out_time'              => now()->subDays(10)->addHours(6),
                        'hours'                       => 5.00,
                        'participation_status'        => 'completed',
                        'feedback'                    => 'Excellent service performance.',
                        'verification_method'         => 'qr_gps',
                        'check_in_latitude'           => 27.7172,
                        'check_in_longitude'          => 85.3240,
                        'attendance_confidence_score' => 0.98,
                        'confidence_level'            => 'high',
                    ]
                );

                // 5. Bidirectional Reviews
                Review::updateOrCreate(
                    [
                        'reviewer_id' => $ngo->user_id,
                        'reviewee_id' => $vol['user']->id,
                        'task_id'     => $task->id,
                    ],
                    ['rating' => 5, 'comment' => 'Outstanding contribution to the workshop!']
                );
                Review::updateOrCreate(
                    [
                        'reviewer_id' => $vol['user']->id,
                        'reviewee_id' => $ngo->user_id,
                        'task_id'     => $task->id,
                    ],
                    ['rating' => 5, 'comment' => 'Well organized and inspiring session.']
                );

                // 6. Trust Score History
                TrustScoreHistory::create([
                    'volunteer_profile_id' => $vol['profile']->id,
                    'previous_score'       => 0.85,
                    'new_score'            => 0.90,
                    'score_change'         => 0.05,
                    'change_reason'        => 'Task completed successfully',
                    'triggered_by'         => 'TaskCompleted',
                ]);

                // 7. Certificate & CertificateAuthentication
                $cNum = 'CERT-SC1-00' . ($i + 1);
                $cert = Certificate::updateOrCreate(
                    [
                        'ngo_id'               => $ngo->id,
                        'volunteer_profile_id' => $vol['profile']->id,
                        'task_id'              => $task->id,
                    ],
                    [
                        'certificate_number' => $cNum,
                        'issued_at'          => now()->subDays(9),
                        'content'            => ['title' => 'Disaster Relief Certificate', 'hours' => 5.00],
                        'issued_by'          => $ngo->user_id,
                    ]
                );

                CertificateAuthentication::updateOrCreate(
                    ['certificate_id' => $cert->id],
                    [
                        'certificate_hash'   => hash('sha256', $cNum),
                        'verification_token' => hash('sha256', $cNum . 'sc1'),
                        'verification_url'   => "http://localhost:8000/api/certificates/verify/" . hash('sha256', $cNum . 'sc1'),
                        'qr_code_path'       => 'certificates/qr_codes/sc1_' . $i . '.png',
                        'status'             => 'active',
                    ]
                );
            }
        }
    }

    private function seedScenario2($ngo, $category, $skills): void
    {
        $task = Task::updateOrCreate(
            ['slug' => 'scenario-2-flood-relief-camp'],
            [
                'ngo_id'               => $ngo->id,
                'category_id'          => $category->id,
                'title'                => 'Scenario 2: Flood Relief Camp',
                'description'          => 'Scenario testing mixed attendance outcomes and trust score penalties.',
                'task_type'            => 'Emergency',
                'selection_logic'      => 'recommendation',
                'location'             => 'Lalitpur Camp Center',
                'city'                 => 'Lalitpur',
                'country'              => 'Nepal',
                'latitude'             => 27.6765,
                'longitude'            => 85.3250,
                'required_volunteers'  => 4,
                'start_date'           => now()->subDays(5),
                'end_date'             => now()->subDays(4),
                'application_deadline' => now()->subDays(7),
                'status'               => 'Completed',
                'urgency_level'        => 'High',
                'created_by'           => $ngo->user_id,
            ]
        );

        $outcomes = [
            ['status' => 'completed', 'late' => false],
            ['status' => 'completed', 'late' => true],
            ['status' => 'absent',    'late' => false],
        ];

        for ($i = 0; $i < 3; $i++) {
            $u = User::firstOrCreate(
                ['email' => "sc2.vol" . ($i + 1) . "@example.com"],
                [
                    'name'     => "Scenario 2 Vol " . ($i + 1),
                    'phone'    => "983000000" . ($i + 1),
                    'password' => Hash::make('password'),
                    'role'     => 'volunteer',
                    'is_active'=> true,
                ]
            );
            $p = VolunteerProfile::updateOrCreate(
                ['user_id' => $u->id],
                [
                    'bio'                 => 'Scenario 2 Test Volunteer',
                    'city'                => 'Lalitpur',
                    'country'             => 'Nepal',
                    'latitude'            => 27.6765,
                    'longitude'           => 85.3250,
                    'availability'        => 'Available',
                    'is_profile_complete' => true,
                    'trust_score'         => 0.75,
                ]
            );

            Application::updateOrCreate(
                ['task_id' => $task->id, 'volunteer_profile_id' => $p->id],
                ['status' => 'Accepted', 'applied_at' => now()->subDays(8), 'reviewed_by' => $ngo->user_id]
            );

            $out = $outcomes[$i];

            if ($out['status'] === 'completed') {
                $lateMin = $out['late'] ? 30 : 0;
                ServiceLog::updateOrCreate(
                    ['volunteer_profile_id' => $p->id, 'task_id' => $task->id],
                    [
                        'check_in_time'        => now()->subDays(5)->addMinutes($lateMin),
                        'check_out_time'       => now()->subDays(5)->addHours(4),
                        'hours'                => 4.00,
                        'participation_status' => 'completed',
                        'verification_method'  => 'qr_gps',
                    ]
                );

                Review::updateOrCreate(
                    ['reviewer_id' => $ngo->user_id, 'reviewee_id' => $u->id, 'task_id' => $task->id],
                    ['rating' => $out['late'] ? 3 : 4, 'comment' => $out['late'] ? 'Late arrival.' : 'Good work.']
                );

                $cNum = "CERT-SC2-00" . ($i + 1);
                $cert = Certificate::updateOrCreate(
                    ['ngo_id' => $ngo->id, 'volunteer_profile_id' => $p->id, 'task_id' => $task->id],
                    ['certificate_number' => $cNum, 'issued_at' => now()->subDays(4), 'content' => ['title' => 'Flood Relief'], 'issued_by' => $ngo->user_id]
                );

                CertificateAuthentication::updateOrCreate(
                    ['certificate_id' => $cert->id],
                    [
                        'certificate_hash'   => hash('sha256', $cNum),
                        'verification_token' => hash('sha256', $cNum . 'sc2'),
                        'verification_url'   => "http://localhost:8000/api/certificates/verify/" . hash('sha256', $cNum . 'sc2'),
                        'status'             => 'active',
                    ]
                );
            } else { // absent
                ServiceLog::updateOrCreate(
                    ['volunteer_profile_id' => $p->id, 'task_id' => $task->id],
                    [
                        'participation_status' => 'absent',
                        'feedback'             => 'No-show without notice.',
                    ]
                );

                TrustScoreHistory::create([
                    'volunteer_profile_id' => $p->id,
                    'previous_score'       => 0.75,
                    'new_score'            => 0.55,
                    'score_change'         => -0.20,
                    'change_reason'        => 'No-show penalty applied (-0.20)',
                    'triggered_by'         => 'NoShowPenalty',
                ]);
            }
        }
    }

    private function seedScenario3($ngo, $category, $skills): void
    {
        $task = Task::updateOrCreate(
            ['slug' => 'scenario-3-ongoing-health-campaign'],
            [
                'ngo_id'               => $ngo->id,
                'category_id'          => $category->id,
                'title'                => 'Scenario 3: Ongoing Health Campaign',
                'description'          => 'Scenario testing application withdrawals, NGO cancellation, and active duty.',
                'task_type'            => 'Campaign',
                'selection_logic'      => 'manual',
                'location'             => 'Pokhara Health Desk',
                'city'                 => 'Pokhara',
                'country'              => 'Nepal',
                'latitude'             => 28.2096,
                'longitude'            => 83.9595,
                'required_volunteers'  => 3,
                'start_date'           => now()->subDays(1),
                'end_date'             => now()->addDays(5),
                'application_deadline' => now()->subDays(3),
                'status'               => 'Ongoing',
                'urgency_level'        => 'Medium',
                'created_by'           => $ngo->user_id,
            ]
        );

        $appStatuses = ['Withdrawn', 'Cancelled', 'Accepted'];

        for ($i = 0; $i < 3; $i++) {
            $u = User::firstOrCreate(
                ['email' => "sc3.vol" . ($i + 1) . "@example.com"],
                [
                    'name'     => "Scenario 3 Vol " . ($i + 1),
                    'phone'    => "984000000" . ($i + 1),
                    'password' => Hash::make('password'),
                    'role'     => 'volunteer',
                    'is_active'=> true,
                ]
            );
            $p = VolunteerProfile::updateOrCreate(
                ['user_id' => $u->id],
                [
                    'bio'                 => 'Scenario 3 Test Volunteer',
                    'city'                => 'Pokhara',
                    'country'             => 'Nepal',
                    'latitude'            => 28.2096,
                    'longitude'           => 83.9595,
                    'availability'        => 'Available',
                    'is_profile_complete' => true,
                    'trust_score'         => 0.80,
                ]
            );

            $st = $appStatuses[$i];
            Application::updateOrCreate(
                ['task_id' => $task->id, 'volunteer_profile_id' => $p->id],
                [
                    'status'     => $st,
                    'applied_at' => now()->subDays(5),
                    'remarks'    => ($st === 'Withdrawn') ? 'Personal emergency' : (($st === 'Cancelled') ? 'NGO canceled position' : 'Accepted'),
                ]
            );

            if ($st === 'Accepted') {
                ServiceLog::updateOrCreate(
                    ['volunteer_profile_id' => $p->id, 'task_id' => $task->id],
                    [
                        'check_in_time'        => now()->subHours(2),
                        'participation_status' => 'active',
                        'verification_method'  => 'qr_gps',
                    ]
                );
            }
        }
    }
}
