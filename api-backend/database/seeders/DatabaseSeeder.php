<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            SkillSeeder::class,
            WorkflowStateSeeder::class,
            WorkflowTransitionSeeder::class,
            SystemSettingSeeder::class,
            AdminSeeder::class,
            OrganizationSeeder::class,

            // Core domain seeders
            VolunteerProfileSeeder::class,
            TaskSeeder::class,

            // Algorithm test seeders
            MatchingTestSeeder::class,
            RankingValidationSeeder::class,

            // Lifecycle seeders
            ApplicationSeeder::class,
            ServiceLogSeeder::class,
            ReviewSeeder::class,
            CertificateSeeder::class,
            NotificationSeeder::class,

            // End-to-end scenarios
            WorkflowScenarioSeeder::class,
        ]);
    }
}
