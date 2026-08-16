<?php

namespace App\Services\Crypto;

use InvalidArgumentException;


final class FileDecryptor
{
    public const CHUNK_SIZE = 65536;

    public const TAG_LENGTH = 16;

    /**
     * Validate and decrypt $sourcePath streaming into $outputPath.
     *
     * @param string $sourcePath path to the encrypted file
     * @param string $outputPath path where the plaintext is written
     * @param string $key        32-byte AES-256 key
     * @param string $iv         12-byte IV used for encryption
     * @param string $tag        16-byte authentication tag
     * @param string $aad        the same additional data as at encryption
     *
     * @throws InvalidArgumentException when the tag does not verify
     *
     * @return bool true on success
     */
    public function decrypt(
        string $sourcePath,
        string $outputPath,
        string $key,
        string $iv,
        string $tag,
        string $aad = ''
    ): bool {
        if (strlen($key) !== 32) {
            throw new InvalidArgumentException(
                'AES-256 requires a 32-byte key, got ' . strlen($key) . ' bytes.'
            );
        }

        if (strlen($iv) !== 12) {
            throw new InvalidArgumentException(
                'GCM requires a 96-bit (12 byte) IV, got ' . strlen($iv) . ' bytes.'
            );
        }

        $handle = fopen($sourcePath, 'rb');
        if ($handle === false) {
            throw new InvalidArgumentException('Unable to open the encrypted file.');
        }

        $cipher = new AES256($key);
        $j0 = $iv . pack('N', 1);

        if (!$this->verifyTag($handle, $cipher, $j0, $tag, $aad)) {
            fclose($handle);
            throw new InvalidArgumentException(
                'AES-256-GCM authentication tag verification failed. ' .
                'The file, IV, tag or metadata has been altered.'
            );
        }

        rewind($handle);

        $output = fopen($outputPath, 'wb');
        if ($output === false) {
            fclose($handle);
            throw new InvalidArgumentException('Unable to open the output file.');
        }

        $ctr = new CTRMode($cipher, CTRMode::inc32($j0));

        try {
            while (!feof($handle)) {
                $chunk = fread($handle, self::CHUNK_SIZE);
                if ($chunk === false || $chunk === '') {
                    break;
                }

                fwrite($output, $chunk ^ $ctr->keystream(strlen($chunk)));
            }
        } finally {
            fclose($handle);
            fclose($output);
        }

        return true;
    }

    /**
     * Recompute the GCM tag over the whole stream and compare constant-time.
     */
    private function verifyTag(
        $handle,
        AES256 $cipher,
        string $j0,
        string $tag,
        string $aad
    ): bool {
        if (strlen($tag) !== self::TAG_LENGTH) {
            return false;
        }

        $ghash = new GHASH($cipher->encrypt(str_repeat("\0", 16)));
        if ($aad !== '') {
            $ghash->absorbAad($aad);
        }

        while (!feof($handle)) {
            $chunk = fread($handle, self::CHUNK_SIZE);
            if ($chunk === false || $chunk === '') {
                break;
            }

            $ghash->absorbCiphertext($chunk);
        }

        $expected = substr(
            $ghash->finalize() ^ $cipher->encrypt($j0),
            0,
            self::TAG_LENGTH
        );

        return hash_equals($expected, $tag);
    }
}
