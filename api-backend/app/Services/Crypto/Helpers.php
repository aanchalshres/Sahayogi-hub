<?php

namespace App\Services\Crypto;

use InvalidArgumentException;

final class Helpers
{

    public static function generateAESKey(): string
    {
        return random_bytes(32);
    }


    public static function generateIV(): string
    {
        return random_bytes(12);
    }

    /**
     * Encrypt and authenticate a binary string with AES-256-GCM.
     *
     * @param string $plaintext          binary plaintext
     * @param string $key                32-byte AES-256 key
     * @param string $aad                additional authenticated data (optional)
     * @param string|null $iv            12-byte IV; generated when omitted
     *
     * @return array{ciphertext: string, iv: string, tag: string}
     */
    public static function encryptBytes(
        string $plaintext,
        string $key,
        string $aad = '',
        ?string $iv = null
    ): array {
        $iv = $iv ?? self::generateIV();
        $gcm = new GCM($key);

        $result = $gcm->encrypt($plaintext, $iv, $aad);

        return [
            'ciphertext' => $result['ciphertext'],
            'iv' => $iv,
            'tag' => $result['tag'],
        ];
    }

    /**
     * Decrypt (and authenticate) a binary string with AES-256-GCM.
     *
     * The tag is verified BEFORE any plaintext is produced. When the tag
     * does not match, an InvalidArgumentException is thrown.
     *
     * @param string $ciphertext encrypted binary
     * @param string $key        32-byte AES-256 key
     * @param string $iv         12-byte IV used for encryption
     * @param string $tag        16-byte authentication tag
     * @param string $aad        the same AAD used for encryption
     */
    public static function decryptBytes(
        string $ciphertext,
        string $key,
        string $iv,
        string $tag,
        string $aad = ''
    ): string {
        return (new GCM($key))->decrypt($ciphertext, $iv, $tag, $aad);
    }

    /**
     * Stream-encrypt a whole file with AES-256-GCM.
     *
     * The source file is read in 64 KiB chunks and the ciphertext is
     * written streaming to the output path; the authentication tag is
     * accumulated incrementally, so memory stays flat regardless of the
     * file size.
     *
     * @return array{iv: string, tag: string} values to persist for decrypt
     */
    public static function encryptFile(
        string $sourcePath,
        string $outputPath,
        string $key,
        string $aad = ''
    ): array {
        return (new FileEncryptor())->encrypt($sourcePath, $outputPath, $key, aad: $aad);
    }

 
    public static function decryptFile(
        string $sourcePath,
        string $outputPath,
        string $key,
        string $iv,
        string $tag,
        string $aad = ''
    ): bool {
        return (new FileDecryptor())->decrypt($sourcePath, $outputPath, $key, $iv, $tag, $aad);
    }

    /**
     * Generate the GCM authentication tag for an already-encrypted byte
     * stream. Equivalent to the tag returned by GCM::encrypt().
     *
     * @param string $ciphertext the encrypted bytes
     * @param string $key        32-byte AES-256 key
     * @param string $iv         12-byte IV
     * @param string $aad        associated data bound into the tag
     */
    public static function generateAuthenticationTag(
        string $ciphertext,
        string $key,
        string $iv,
        string $aad = ''
    ): string {
        return (new GCM($key))->generateAuthenticationTag($ciphertext, $iv, $aad);
    }

    /**
     * Constant-time verification of an authentication tag.
     *
     * @return bool true when the tag authenticates the bytes
     */
    public static function verifyAuthenticationTag(
        string $ciphertext,
        string $key,
        string $iv,
        string $tag,
        string $aad = ''
    ): bool {
        return (new GCM($key))->verifyTag($ciphertext, $iv, $tag, $aad);
    }
}
