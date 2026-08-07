<?php

namespace App\Services;

use App\Models\EncryptedDocument;
use App\Services\Crypto\FileDecryptor;
use App\Services\Crypto\FileEncryptor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Encrypts, stores, retrieves and deletes user documents through the
 * pure-PHP AES-256-GCM layer (App\Services\Crypto).
 *
 * Encrypted files live on the private "local" disk (never served
 * statically) and only leave the application inside authenticated download
 * responses.
 */
class EncryptedDocumentService
{
    public const DISK = 'local';

    public const ALGORITHM = 'aes-256-gcm';

    /**
     * Encrypt an uploaded file and persist its envelope.
     *
     * A fresh 96-bit IV is generated per document and the authentication
     * tag binds the document metadata (name, mime, size, owner) as AAD, so
     * any tampering with the record is detected at download time.
     */
    public function store(
        UploadedFile $file,
        int $ownerId,
        string $ownerRole,
        ?string $originalName = null
    ): EncryptedDocument {
        $disk = Storage::disk(self::DISK);
        $name = $originalName ?? $file->getClientOriginalName();
        $aad = $this->buildAad($name, $file->getMimeType(), $file->getSize(), $ownerRole, $ownerId);

        $directory = 'encrypted-documents/' . now()->format('Y/m');
        $encryptedPath = $directory . '/' . str()->uuid() . '.enc';

        $envelope = (new FileEncryptor())->encrypt(
            $file->getRealPath(),
            $disk->path($encryptedPath),
            $this->documentKey(),
            aad: $aad,
        );

        // Portable sidecar so the ciphertext never depends on the database.
        $disk->put($encryptedPath . '.meta', json_encode([
            'iv' => base64_encode($envelope['iv']),
            'tag' => base64_encode($envelope['tag']),
            'aad' => base64_encode($aad),
            'algorithm' => self::ALGORITHM,
            'original_name' => $name,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ], JSON_THROW_ON_ERROR));

        return EncryptedDocument::create([
            'owner_role' => $ownerRole,
            'owner_id' => $ownerId,
            'original_filename' => $name,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'encrypted_file_path' => $encryptedPath,
            'iv' => base64_encode($envelope['iv']),
            'authentication_tag' => base64_encode($envelope['tag']),
            'encryption_algorithm' => self::ALGORITHM,
        ]);
    }

    /**
     * Authenticate and decrypt a stored document into a download response.
     *
     * Decryption goes through a temporary file that is removed after the
     * response has been sent. When the tag does not verify the tampered
     * file is rejected before any plaintext is produced.
     */
    public function download(EncryptedDocument $document): BinaryFileResponse
    {
        $disk = Storage::disk(self::DISK);

        if (!$disk->exists($document->encrypted_file_path)) {
            throw new RuntimeException('Encrypted document file is missing.');
        }

        $aad = $this->buildAad(
            $document->original_filename,
            $document->mime_type,
            $document->file_size,
            $document->owner_role,
            $document->owner_id,
        );

        $temp = tempnam(sys_get_temp_dir(), 'encrypted-document-');
        if ($temp === false) {
            throw new RuntimeException('Unable to allocate a temporary file.');
        }

        try {
            (new FileDecryptor())->decrypt(
                $disk->path($document->encrypted_file_path),
                $temp,
                $this->documentKey(),
                base64_decode($document->iv, true),
                base64_decode($document->authentication_tag, true),
                $aad,
            );

            return response()
                ->download($temp, $document->original_filename, [
                    'Content-Type' => $document->mime_type ?? 'application/octet-stream',
                ])
                ->deleteFileAfterSend(true);
        } catch (\Throwable $e) {
            @unlink($temp);
            throw $e;
        }
    }

    /**
     * Remove the encrypted file, sidecar metadata and the database record.
     */
    public function destroy(EncryptedDocument $document): void
    {
        $disk = Storage::disk(self::DISK);
        $disk->delete($document->encrypted_file_path);
        $disk->delete($document->encrypted_file_path . '.meta');
        $document->delete();
    }

    /**
     * Resolve the 32-byte AES-256 key.
     *
     * Prefers DOCUMENT_ENCRYPTION_KEY (Base64 of exactly 32 bytes) and
     * falls back to a SHA-256 derivation of APP_KEY so the feature works
     * out of the box on existing installs.
     */
    public function documentKey(): string
    {
        $configured = config('encryption.document_encryption_key');

        if ($configured !== null && $configured !== '') {
            $decoded = base64_decode($configured, true);
            if ($decoded !== false && strlen($decoded) === 32) {
                return $decoded;
            }
        }

        $appKey = config('app.key');
        if (is_string($appKey) && $appKey !== '') {
            $material = str_starts_with($appKey, 'base64:')
                ? base64_decode(substr($appKey, 7), true) ?: $appKey
                : $appKey;

            return substr(hash('sha256', $material, true), 0, 32);
        }

        throw new RuntimeException(
            'Document encryption key is not configured. Run `php artisan encryption:document-key`.'
        );
    }

    /**
     * Canonical AAD binding document metadata and ownership into the tag.
     */
    private function buildAad(
        string $name,
        ?string $mime,
        int $size,
        string $ownerRole,
        int $ownerId
    ): string {
        $payload = [
            'name' => $name,
            'mime' => $mime ?? 'application/octet-stream',
            'size' => $size,
            'owner_role' => $ownerRole,
            'owner_id' => $ownerId,
        ];
        ksort($payload);

        return json_encode($payload, JSON_THROW_ON_ERROR);
    }
}