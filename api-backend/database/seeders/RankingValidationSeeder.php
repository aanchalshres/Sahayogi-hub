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

/**
 * RankingValidationSeeder
 *
 * Purpose: Creates 1 task and 10 volunteers designed to produce a strictly ordered 1 to 10 ranking.
 *
 * Expected Scores & Strict Order (Default Recommendation Strategy):
 * Rank  1: Vol 1  (Score: 0.98) - Perfect attributes, Trust 0.95
 * Rank  2: Vol 2  (Score: 0.93) - Perfect attributes, Trust 0.70
 * Rank  3: Vol 3  (Score: 0.88) - Perfect attributes, Trust 0.45
 * Rank  4: Vol 4  (Score: 0.85) - 2/3 skills, 0 km, Trust 0.75
 * Rank  5: Vol 5  (Score: 0.77) - 2/3 skills, 100 km, Trust 0.70
 * Rank  6: Vol 6  (Score: 0.68) - 1/3 skills + 1 extra, 100 km, Trust 0.65
 * Rank  7: Vol 7  (Score: 0.59) - 1/3 skills + 1 extra, 200 km, Trust 0.55
 * Rank  8: Vol 8  (Score: 0.44) - 1/3 skills, 300 km, Trust 0.45
 * Rank  9: Vol 9  (Score: 0.32) - 0 skills, 300 km, Trust 0.30
 * Rank 10: Vol 10 (Score: 0.11) - 0 skills, 400 km, Unavailable, Trust 0.15
 */
class RankingValidationSeeder extends Seeder
{
    public function run(): void
    {
        $ngo = NgoProfile::first();
        $category = Category::where('name', 'Healthcare')->first() ?? Category::first();
        $skills = Skill::pluck('id', 'name');

        if (!$ngo || !$category) {
            $this->command?->error('NGO or Category missing.');
            return;
        }

        // 1. Task in Kathmandu (27.7172, 85.3240)
        $task = Task::updateOrCreate(
            ['slug' => 'ranking-validation-medical-task'],
            [
                'ngo_id'               => $ngo->id,
                'category_id'          => $category->id,
                'title'                => 'Ranking Validation Medical Task',
                'description'          => 'Task to validate strict ranking ordering for top 10 candidates.',
                'task_type'            => 'Event',
                'selection_logic'      => 'recommendation',
                'location'             => 'Kathmandu Durbar Square Health Desk',
                'city'                 => 'Kathmandu',
                'country'              => 'Nepal',
                'latitude'             => 27.7172,
                'longitude'            => 85.3240,
                'required_volunteers'  => 10,
                'start_date'           => now()->addDays(15),
                'end_date'             => now()->addDays(16),
                'application_deadline' => now()->addDays(12),
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

        // 2. 10 Volunteers with strict expected rankings
        $rankingVolunteers = [
            [
                'rank' => 1, 'name' => 'Rank #1 Volunteer', 'email' => 'rank1.top@example.com',
                'lat' => 27.7172, 'lng' => 85.3240, 'avail' => 'Available', 'trust' => 0.95,
                'vector' => [1.0, 0.0, 0.0], 'skills' => ['First Aid' => 'expert', 'CPR' => 'expert', 'Triage' => 'expert'],
                'doc' => 'Skill: 1.00, Dist: 1.00, Trust: 0.95, Avail: 0.90, Sem: 1.00 -> Expected Score: 0.98',
            ],
            [
                'rank' => 2, 'name' => 'Rank #2 Volunteer', 'email' => 'rank2.high@example.com',
                'lat' => 27.7172, 'lng' => 85.3240, 'avail' => 'Available', 'trust' => 0.70,
                'vector' => [1.0, 0.0, 0.0], 'skills' => ['First Aid' => 'expert', 'CPR' => 'expert', 'Triage' => 'expert'],
                'doc' => 'Skill: 1.00, Dist: 1.00, Trust: 0.70, Avail: 0.90, Sem: 1.00 -> Expected Score: 0.93',
            ],
            [
                'rank' => 3, 'name' => 'Rank #3 Volunteer', 'email' => 'rank3.midhigh@example.com',
                'lat' => 27.7172, 'lng' => 85.3240, 'avail' => 'Available', 'trust' => 0.45,
                'vector' => [1.0, 0.0, 0.0], 'skills' => ['First Aid' => 'expert', 'CPR' => 'expert', 'Triage' => 'expert'],
                'doc' => 'Skill: 1.00, Dist: 1.00, Trust: 0.45, Avail: 0.90, Sem: 1.00 -> Expected Score: 0.88',
            ],
            [
                'rank' => 4, 'name' => 'Rank #4 Volunteer', 'email' => 'rank4.good@example.com',
                'lat' => 27.7172, 'lng' => 85.3240, 'avail' => 'Available', 'trust' => 0.75,
                'vector' => [0.8, 0.6, 0.0], 'skills' => ['First Aid' => 'intermediate', 'CPR' => 'intermediate'],
                'doc' => 'Skill: 0.83, Dist: 1.00, Trust: 0.75, Avail: 0.90, Sem: 0.80 -> Expected Score: 0.85',
            ],
            [
                'rank' => 5, 'name' => 'Rank #5 Volunteer', 'email' => 'rank5.medium@example.com',
                'lat' => 27.7172 + (100/111), 'lng' => 85.3240, 'avail' => 'Available', 'trust' => 0.70,
                'vector' => [0.7, 0.7, 0.0], 'skills' => ['First Aid' => 'intermediate', 'CPR' => 'intermediate'],
                'doc' => 'Skill: 0.83, Dist: 0.80, Trust: 0.70, Avail: 0.90, Sem: 0.70 -> Expected Score: 0.77',
            ],
            [
                'rank' => 6, 'name' => 'Rank #6 Volunteer', 'email' => 'rank6.midlow@example.com',
                'lat' => 27.7172 + (100/111), 'lng' => 85.3240, 'avail' => 'Available', 'trust' => 0.65,
                'vector' => [0.6, 0.8, 0.0], 'skills' => ['First Aid' => 'intermediate', 'Teaching' => 'expert'],
                'doc' => 'Skill: 0.58, Dist: 0.80, Trust: 0.65, Avail: 0.90, Sem: 0.60 -> Expected Score: 0.68',
            ],
            [
                'rank' => 7, 'name' => 'Rank #7 Volunteer', 'email' => 'rank7.farter@example.com',
                'lat' => 27.7172 + (200/111), 'lng' => 85.3240, 'avail' => 'Available', 'trust' => 0.55,
                'vector' => [0.5, 0.8, 0.0], 'skills' => ['First Aid' => 'intermediate', 'Teaching' => 'expert'],
                'doc' => 'Skill: 0.58, Dist: 0.60, Trust: 0.55, Avail: 0.90, Sem: 0.50 -> Expected Score: 0.59',
            ],
            [
                'rank' => 8, 'name' => 'Rank #8 Volunteer', 'email' => 'rank8.lowskills@example.com',
                'lat' => 27.7172 + (300/111), 'lng' => 85.3240, 'avail' => 'Available', 'trust' => 0.45,
                'vector' => [0.4, 0.9, 0.0], 'skills' => ['First Aid' => 'beginner'],
                'doc' => 'Skill: 0.29, Dist: 0.40, Trust: 0.45, Avail: 0.90, Sem: 0.40 -> Expected Score: 0.44',
            ],
            [
                'rank' => 9, 'name' => 'Rank #9 Volunteer', 'email' => 'rank9.noskills@example.com',
                'lat' => 27.7172 + (300/111), 'lng' => 85.3240, 'avail' => 'Available', 'trust' => 0.30,
                'vector' => [0.3, 0.9, 0.0], 'skills' => [],
                'doc' => 'Skill: 0.00, Dist: 0.40, Trust: 0.30, Avail: 0.90, Sem: 0.30 -> Expected Score: 0.32',
            ],
            [
                'rank' => 10, 'name' => 'Rank #10 Volunteer', 'email' => 'rank10.bottom@example.com',
                'lat' => 27.7172 + (400/111), 'lng' => 85.3240, 'avail' => 'Unavailable', 'trust' => 0.15,
                'vector' => [0.1, 0.9, 0.0], 'skills' => [],
                'doc' => 'Skill: 0.00, Dist: 0.20, Trust: 0.15, Avail: 0.10, Sem: 0.10 -> Expected Score: 0.11',
            ],
        ];

        foreach ($rankingVolunteers as $rv) {
            $user = User::firstOrCreate(
                ['email' => $rv['email']],
                [
                    'name'              => $rv['name'],
                    'phone'             => '9811' . str_pad((string)$rv['rank'], 6, '0', STR_PAD_LEFT),
                    'password'          => Hash::make('password'),
                    'role'              => 'volunteer',
                    'is_active'         => true,
                    'email_verified_at' => now(),
                ]
            );

            $profile = VolunteerProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'bio'                  => "Deterministic candidate for Rank #{$rv['rank']}. {$rv['doc']}",
                    'primary_location'     => "Rank #{$rv['rank']} Location",
                    'city'                 => 'Kathmandu',
                    'country'              => 'Nepal',
                    'latitude'             => $rv['lat'],
                    'longitude'            => $rv['lng'],
                    'availability'         => $rv['avail'],
                    'is_profile_complete'  => true,
                    'trust_score'          => $rv['trust'],
                    'trust_updated_at'     => now(),
                    'tfidf_vector'         => $rv['vector'],
                    'total_service_hours'  => (11 - $rv['rank']) * 10,
                    'average_rating'       => 5.0 - ($rv['rank'] * 0.2),
                ]
            );

            $skillSync = [];
            foreach ($rv['skills'] as $sName => $prof) {
                if (isset($skills[$sName])) {
                    $skillSync[$skills[$sName]] = ['proficiency_level' => $prof];
                }
            }
            $profile->skills()->sync($skillSync);
        }

        $this->command?->info('RankingValidationSeeder executed successfully: 1 task and 10 strictly ranked volunteers seeded.');
    }
}
