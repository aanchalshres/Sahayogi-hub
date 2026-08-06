<?php

namespace Database\Seeders;

use App\Models\Certificate;
use App\Models\CertificateAuthentication;
use App\Models\ServiceLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CertificateSeeder extends Seeder
{
    public function run(): void
    {
        // Only completed service logs
        $completedLogs = ServiceLog::with(['task.ngo', 'volunteer.user'])
            ->where('participation_status', 'completed')
            ->get();

        if ($completedLogs->isEmpty()) {
            $this->command?->error('No completed service logs found. Run ServiceLogSeeder first.');
            return;
        }

        $certCount = 0;
        $index = 10001;

        foreach ($completedLogs as $log) {
            $task = $log->task;
            $vol = $log->volunteer;
            $volUser = $vol?->user;

            if (!$task || !$task->ngo || !$vol || !$volUser) continue;

            $certNum = 'CERT-SEED-' . ($index++);

            $certContent = [
                'certificate_number' => $certNum,
                'volunteer_name'     => $volUser->name,
                'organization_name'  => $task->ngo->organization_name,
                'task_title'         => $task->title,
                'service_hours'      => (float)$log->hours,
                'issued_date'        => now()->toDateString(),
                'description'        => "Certificate of appreciation awarded to {$volUser->name} for contributing {$log->hours} service hours to {$task->title}.",
            ];

            $cert = Certificate::updateOrCreate(
                [
                    'ngo_id'               => $task->ngo_id,
                    'volunteer_profile_id' => $vol->id,
                    'task_id'              => $task->id,
                ],
                [
                    'certificate_number' => $certNum,
                    'issued_at'          => now(),
                    'content'            => $certContent,
                    'issued_by'          => $task->ngo->user_id,
                ]
            );

            // Seed matching CertificateAuthentication
            $token = hash('sha256', $certNum . $cert->id . 'salt_seed');
            $certHash = hash('sha256', $certNum);

            CertificateAuthentication::updateOrCreate(
                ['certificate_id' => $cert->id],
                [
                    'certificate_hash'   => $certHash,
                    'verification_token' => $token,
                    'verification_url'   => config('app.url', 'http://localhost:8000') . "/api/certificates/verify/{$token}",
                    'qr_code_path'       => 'certificates/qr_codes/placeholder_' . $cert->id . '.png',
                    'status'             => 'active',
                    'is_revoked'         => false,
                    'verification_count' => rand(0, 5),
                    'last_verified_at'   => now()->subDays(rand(1, 10)),
                ]
            );

            $certCount++;
        }

        $this->command?->info("CertificateSeeder executed successfully: {$certCount} certificates and matching verification records seeded.");
    }
}
