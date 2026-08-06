<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\VolunteerProfile;
use App\Models\NgoProfile;
use App\Models\Task;
use App\Models\Category;
use App\Models\Skill;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * MatchingTestSeeder
 *
 * Purpose: Creates a deterministic test case to validate every weight in the volunteer matching algorithm.
 *
 * Algorithm Weights (Default Recommendation Strategy):
 * - Semantic Match:     30%  (w1 = 0.30)
 * - Distance Score:     20%  (w2 = 0.20)
 * - Skill Overlap:      20%  (w3 = 0.20)
 * - Availability:       10%  (w4 = 0.10)
 * - Trust Score:        20%  (w5 = 0.20)
 *
 * Formula: Score = (0.30 * Semantic) + (0.20 * Distance) + (0.20 * Skill) + (0.10 * Availability) + (0.20 * Trust)
 */
class MatchingTestSeeder extends Seeder
{
    public function run(): void
    {
        $ngo = NgoProfile::first();
        $category = Category::where('name', 'Healthcare')->first() ?? Category::first();
        $skills = Skill::pluck('id', 'name');

        if (!$ngo || !$category) {
            $this->command?->error('NGO or Category missing. Please run OrganizationSeeder and CategorySeeder first.');
            return;
        }

        // 1. Create the single test task at Kathmandu (27.7172, 85.3240)
        $task = Task::updateOrCreate(
            ['slug' => 'test-matching-emergency-response-task'],
            [
                'ngo_id'               => $ngo->id,
                'category_id'          => $category->id,
                'title'                => 'Test Matching Emergency Response Task',
                'description'          => 'Deterministic task for validating the VRVS hybrid matching algorithm.',
                'task_type'            => 'Emergency',
                'selection_logic'      => 'recommendation',
                'location'             => 'Kathmandu Central Hospital, Kathmandu',
                'city'                 => 'Kathmandu',
                'country'              => 'Nepal',
                'latitude'             => 27.7172,
                'longitude'            => 85.3240,
                'required_volunteers'  => 5,
                'start_date'           => now()->addDays(10),
                'end_date'             => now()->addDays(12),
                'application_deadline' => now()->addDays(8),
                'status'               => 'Open',
                'urgency_level'        => 'High',
                'created_by'           => $ngo->user_id,
                'tfidf_vector'         => [1.0, 0.0, 0.0],
            ]
        );

        $requiredSkills = ['First Aid', 'CPR', 'Triage'];
        $taskSkillIds = [];
        foreach ($requiredSkills as $sName) {
            if (isset($skills[$sName])) {
                $taskSkillIds[] = $skills[$sName];
            }
        }
        $task->skills()->sync($taskSkillIds);

        // 2. Define the 8 deterministic test cases
        $testCases = [
            /*
             * Case 1: Perfect Match
             * - Semantic: 1.00 ([1.0, 0.0, 0.0])
             * - Distance: 1.00 (0 km - Kathmandu 27.7172, 85.3240)
             * - Skill:    1.00 (has all 3 required skills)
             * - Avail:    0.90 ('Available' for future task)
             * - Trust:    0.90
             * Expected Score = (0.30*1.0) + (0.20*1.0) + (0.20*1.0) + (0.10*0.9) + (0.20*0.9) = 0.30 + 0.20 + 0.20 + 0.09 + 0.18 = 0.97
             */
            [
                'name'         => 'TestVol 1 (Perfect Match)',
                'email'        => 'testvol1.perfect@example.com',
                'lat'          => 27.7172, 'lng' => 85.3240,
                'availability' => 'Available',
                'trust'        => 0.90,
                'vector'       => [1.0, 0.0, 0.0],
                'skills'       => ['First Aid' => 'expert', 'CPR' => 'expert', 'Triage' => 'expert'],
                'expected'     => ['semantic' => 1.00, 'distance' => 1.00, 'skill' => 1.00, 'avail' => 0.90, 'trust' => 0.90, 'final' => 0.97],
            ],

            /*
             * Case 2: Far Distance Match
             * - Semantic: 1.00 ([1.0, 0.0, 0.0])
             * - Distance: 0.60 (~200 km away - 26.4500, 87.2700 Biratnagar approx)
             * - Skill:    1.00 (has all 3 required skills)
             * - Avail:    0.90 ('Available')
             * - Trust:    0.90
             * Expected Score = (0.30*1.0) + (0.20*0.6) + (0.20*1.0) + (0.10*0.9) + (0.20*0.9) = 0.30 + 0.12 + 0.20 + 0.09 + 0.18 = 0.89
             */
            [
                'name'         => 'TestVol 2 (Far Distance)',
                'email'        => 'testvol2.fardistance@example.com',
                'lat'          => 26.4500, 'lng' => 87.2700,
                'availability' => 'Available',
                'trust'        => 0.90,
                'vector'       => [1.0, 0.0, 0.0],
                'skills'       => ['First Aid' => 'expert', 'CPR' => 'expert', 'Triage' => 'expert'],
                'expected'     => ['semantic' => 1.00, 'distance' => 0.60, 'skill' => 1.00, 'avail' => 0.90, 'trust' => 0.90, 'final' => 0.89],
            ],

            /*
             * Case 3: Avg Skill, High Trust
             * - Semantic: 0.60 ([0.6, 0.8, 0.0])
             * - Distance: 1.00 (0 km - Kathmandu)
             * - Skill:    0.58 (2 of 3 required skills + 1 extra)
             * - Avail:    0.90 ('Available')
             * - Trust:    0.95
             * Expected Score = (0.30*0.6) + (0.20*1.0) + (0.20*0.58) + (0.10*0.9) + (0.20*0.95) = 0.18 + 0.20 + 0.116 + 0.09 + 0.19 = 0.776 (~0.78)
             */
            [
                'name'         => 'TestVol 3 (Avg Skill High Trust)',
                'email'        => 'testvol3.hightrust@example.com',
                'lat'          => 27.7172, 'lng' => 85.3240,
                'availability' => 'Available',
                'trust'        => 0.95,
                'vector'       => [0.6, 0.8, 0.0],
                'skills'       => ['First Aid' => 'intermediate', 'CPR' => 'intermediate', 'Teaching' => 'expert'],
                'expected'     => ['semantic' => 0.60, 'distance' => 1.00, 'skill' => 0.58, 'avail' => 0.90, 'trust' => 0.95, 'final' => 0.78],
            ],

            /*
             * Case 4: Excellent Skills, Poor Trust
             * - Semantic: 1.00 ([1.0, 0.0, 0.0])
             * - Distance: 1.00 (0 km)
             * - Skill:    1.00 (all 3 skills)
             * - Avail:    0.90 ('Available')
             * - Trust:    0.15 (very low trust score penalty)
             * Expected Score = (0.30*1.0) + (0.20*1.0) + (0.20*1.0) + (0.10*0.9) + (0.20*0.15) = 0.30 + 0.20 + 0.20 + 0.09 + 0.03 = 0.82
             */
            [
                'name'         => 'TestVol 4 (Good Skill Poor Trust)',
                'email'        => 'testvol4.poortrust@example.com',
                'lat'          => 27.7172, 'lng' => 85.3240,
                'availability' => 'Available',
                'trust'        => 0.15,
                'vector'       => [1.0, 0.0, 0.0],
                'skills'       => ['First Aid' => 'expert', 'CPR' => 'expert', 'Triage' => 'expert'],
                'expected'     => ['semantic' => 1.00, 'distance' => 1.00, 'skill' => 1.00, 'avail' => 0.90, 'trust' => 0.15, 'final' => 0.82],
            ],

            /*
             * Case 5: No Skills
             * - Semantic: 0.20 ([0.2, 0.9, 0.0])
             * - Distance: 1.00 (0 km)
             * - Skill:    0.00 (0 skills)
             * - Avail:    0.90 ('Available')
             * - Trust:    0.50
             * Expected Score = (0.30*0.2) + (0.20*1.0) + (0.20*0.0) + (0.10*0.9) + (0.20*0.5) = 0.06 + 0.20 + 0.00 + 0.09 + 0.10 = 0.45
             */
            [
                'name'         => 'TestVol 5 (No Skills)',
                'email'        => 'testvol5.noskills@example.com',
                'lat'          => 27.7172, 'lng' => 85.3240,
                'availability' => 'Available',
                'trust'        => 0.50,
                'vector'       => [0.2, 0.9, 0.0],
                'skills'       => [],
                'expected'     => ['semantic' => 0.20, 'distance' => 1.00, 'skill' => 0.00, 'avail' => 0.90, 'trust' => 0.50, 'final' => 0.45],
            ],

            /*
             * Case 6: Low Availability
             * - Semantic: 1.00 ([1.0, 0.0, 0.0])
             * - Distance: 1.00 (0 km)
             * - Skill:    1.00 (all 3 skills)
             * - Avail:    0.10 ('Unavailable' status penalty)
             * - Trust:    0.80
             * Expected Score = (0.30*1.0) + (0.20*1.0) + (0.20*1.0) + (0.10*0.1) + (0.20*0.8) = 0.30 + 0.20 + 0.20 + 0.01 + 0.16 = 0.87
             */
            [
                'name'         => 'TestVol 6 (Unavailable)',
                'email'        => 'testvol6.unavailable@example.com',
                'lat'          => 27.7172, 'lng' => 85.3240,
                'availability' => 'Unavailable',
                'trust'        => 0.80,
                'vector'       => [1.0, 0.0, 0.0],
                'skills'       => ['First Aid' => 'expert', 'CPR' => 'expert', 'Triage' => 'expert'],
                'expected'     => ['semantic' => 1.00, 'distance' => 1.00, 'skill' => 1.00, 'avail' => 0.10, 'trust' => 0.80, 'final' => 0.87],
            ],

            /*
             * Case 7: Worst Case
             * - Semantic: 0.10 ([0.1, 0.9, 0.0])
             * - Distance: 0.10 (~450 km away)
             * - Skill:    0.00 (0 skills)
             * - Avail:    0.10 ('Unavailable')
             * - Trust:    0.10
             * Expected Score = (0.30*0.1) + (0.20*0.1) + (0.20*0.0) + (0.10*0.1) + (0.20*0.1) = 0.03 + 0.02 + 0.00 + 0.01 + 0.02 = 0.08
             */
            [
                'name'         => 'TestVol 7 (Worst Case)',
                'email'        => 'testvol7.worstcase@example.com',
                'lat'          => 28.0500, 'lng' => 81.6167, // ~450km away in Nepalgunj
                'availability' => 'Unavailable',
                'trust'        => 0.10,
                'vector'       => [0.1, 0.9, 0.0],
                'skills'       => [],
                'expected'     => ['semantic' => 0.10, 'distance' => 0.10, 'skill' => 0.00, 'avail' => 0.10, 'trust' => 0.10, 'final' => 0.08],
            ],

            /*
             * Case 8: Semantic Heavy Match
             * - Semantic: 0.95 ([0.95, 0.1, 0.0])
             * - Distance: 0.40 (~300 km away)
             * - Skill:    0.29 (1 of 3 required skills)
             * - Avail:    0.90 ('Available')
             * - Trust:    0.30
             * Expected Score = (0.30*0.95) + (0.20*0.4) + (0.20*0.29) + (0.10*0.9) + (0.20*0.3) = 0.285 + 0.08 + 0.058 + 0.09 + 0.06 = 0.573 (~0.57)
             */
            [
                'name'         => 'TestVol 8 (Semantic Heavy)',
                'email'        => 'testvol8.semanticheavy@example.com',
                'lat'          => 28.2100, 'lng' => 83.9850, // ~150km away in Pokhara
                'availability' => 'Available',
                'trust'        => 0.30,
                'vector'       => [0.95, 0.1, 0.0],
                'skills'       => ['First Aid' => 'intermediate'],
                'expected'     => ['semantic' => 0.95, 'distance' => 0.40, 'skill' => 0.29, 'avail' => 0.90, 'trust' => 0.30, 'final' => 0.57],
            ],
        ];

        foreach ($testCases as $tc) {
            $user = User::firstOrCreate(
                ['email' => $tc['email']],
                [
                    'name'              => $tc['name'],
                    'phone'             => '980000' . str_pad((string)rand(1000,9999), 4, '0', STR_PAD_LEFT),
                    'password'          => Hash::make('password'),
                    'role'              => 'volunteer',
                    'is_active'         => true,
                    'email_verified_at' => now(),
                ]
            );

            $profile = VolunteerProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'bio'                  => 'Deterministic test profile for matching algorithm validation.',
                    'primary_location'     => 'Test Location',
                    'city'                 => 'Kathmandu',
                    'country'              => 'Nepal',
                    'latitude'             => $tc['lat'],
                    'longitude'            => $tc['lng'],
                    'availability'         => $tc['availability'],
                    'is_profile_complete'  => true,
                    'trust_score'          => $tc['trust'],
                    'trust_updated_at'     => now(),
                    'tfidf_vector'         => $tc['vector'],
                    'total_service_hours'  => 50.00,
                    'average_rating'       => 4.50,
                ]
            );

            // Sync skills
            $skillSync = [];
            foreach ($tc['skills'] as $sName => $prof) {
                if (isset($skills[$sName])) {
                    $skillSync[$skills[$sName]] = ['proficiency_level' => $prof];
                }
            }
            $profile->skills()->sync($skillSync);
        }

        $this->command?->info('MatchingTestSeeder executed successfully: 1 test task and 8 deterministic test volunteers created.');
    }
}
