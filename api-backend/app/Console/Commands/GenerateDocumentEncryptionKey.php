<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class GenerateDocumentEncryptionKey extends Command
{
    protected $signature = 'encryption:document-key';

    protected $description = 'Generate a DOCUMENT_ENCRYPTION_KEY (Base64 of 32 random bytes) for AES-256-GCM document encryption';

    public function handle(): int
    {
        $key = base64_encode(random_bytes(32));
        $envPath = base_path('.env');
        $examplePath = base_path('.env.example');

        foreach ([$envPath, $examplePath] as $path) {
            if (!File::exists($path)) {
                continue;
            }

            $contents = File::get($path);

            if (preg_match('/^DOCUMENT_ENCRYPTION_KEY=.*$/m', $contents)) {
                $contents = preg_replace('/^DOCUMENT_ENCRYPTION_KEY=.*$/m', 'DOCUMENT_ENCRYPTION_KEY=' . $key, $contents);
            } else {
                $contents .= PHP_EOL . 'DOCUMENT_ENCRYPTION_KEY=' . $key . PHP_EOL;
            }

            File::put($path, $contents);
        }

        $this->info('DOCUMENT_ENCRYPTION_KEY generated and saved to .env and .env.example');
        $this->info('Key: ' . $key);

        return self::SUCCESS;
    }
}