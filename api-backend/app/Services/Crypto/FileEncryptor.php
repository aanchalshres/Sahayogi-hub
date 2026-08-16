<?php

namespace App\Services\Crypto;

use InvalidArgumentException;

final class FileEncryptor
{
    public const CHUNK_SIZE = 65536;

    public const TAG_LENGTH = 16;

    /**
     * Encrypt $sourcePath streaming into $outputPath.
     *
     * @param string      $sourcePath path to the plaintext file
     * @param string      $outputPath path where ciphertext is written
     * @param string      $key        32-byte AES-256 key
     * @param string|null $iv         12-byte IV (generated when omitted)
     * @param string      $aad        extra authenticated data bound to the tag
     *
     * @throws InvalidArgumentException when either path cannot be opened
     *
     * @return array{iv: string, tag: string}
     */
    public function encrypt(
        string $sourcePath,
        string $outputPath,
        string $key,
        ?string $iv = null,
        string $aad = ''
    ): array {
        if (strlen($key) !== 32) {
            throw new InvalidArgumentException(
                'AES-256 requires a 32-byte key, got ' . strlen($key) . ' bytes.'
            );
        }

        $iv ??= Helpers::generateIV();
        if (strlen($iv) !== 12) {
            throw new InvalidArgumentException(
                'GCM requires a 96-bit (12 byte) IV, got ' . strlen($iv) . ' bytes.'
            );
        }

        $input = fopen($sourcePath, 'rb');
        $output = fopen($outputPath, 'wb');
        if ($input === false || $output === false) {
            if (is_resource($input)) {
                fclose($input);
            }
            if (is_resource($output)) {
                fclose($output);
            }
            throw new InvalidArgumentException('Unable to open source or output file.');
        }

        $cipher = new AES256($key);
        $j0 = $iv . pack('N', 1);
        $ctr = new CTRMode($cipher, CTRMode::inc32($j0));
        $ghash = new GHASH($cipher->encrypt(str_repeat("\0", 16)));

        if ($aad !== '') {
            $ghash->absorbAad($aad);
        }

        try {
            while (!feof($input)) {
                $chunk = fread($input, self::CHUNK_SIZE);
                if ($chunk === false || $chunk === '') {
                    break;
                }

                $ciphertext = $chunk ^ $ctr->keystream(strlen($chunk));
                fwrite($output, $ciphertext);
                $ghash->absorbCiphertext($ciphertext);
            }

            $tag = $ghash->finalize() ^ $cipher->encrypt($j0);
        } finally {
            fclose($input);
            fclose($output);
        }

        return [
            'iv' => $iv,
            'tag' => substr($tag, 0, self::TAG_LENGTH),
        ];
    }
}
