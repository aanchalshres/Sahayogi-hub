<?php

namespace App\Services\Crypto;

use InvalidArgumentException;

final class GCM
{

    private AES256 $cipher;


    private string $hashSubkey;


    private int $tagLength;


    public function __construct(string $key, int $tagLength = 16)
    {
        if (strlen($key) !== 32) {
            throw new InvalidArgumentException(
                'AES-256-GCM requires a 32-byte key, got ' . strlen($key) . ' bytes.'
            );
        }

        if ($tagLength < 1 || $tagLength > 16) {
            throw new InvalidArgumentException('Tag length must be between 1 and 16 bytes.');
        }

        $this->cipher = new AES256($key);
        $this->hashSubkey = $this->cipher->encrypt(str_repeat("\0", 16));
        $this->tagLength = $tagLength;
    }

    /**
     * Build the initial counter block J0 for a 96-bit IV.
     */
    private static function buildJ0(string $iv): string
    {
        return $iv . pack('N', 1); // IV || 0^31 || 1
    }

    /**
     * Validate a 96-bit IV.
     */
    private static function assertIv(string $iv): void
    {
        if (strlen($iv) !== 12) {
            throw new InvalidArgumentException(
                'GCM requires a 96-bit (12 byte) IV, got ' . strlen($iv) . ' bytes.'
            );
        }
    }


    public function encrypt(string $plaintext, string $iv, string $aad = ''): array
    {
        self::assertIv($iv);

        $j0 = self::buildJ0($iv);

        // Keystream starts at J1 = inc32(J0); J0 itself is the tag mask.
        $ctr = new CTRMode($this->cipher, CTRMode::inc32($j0));
        $ciphertext = $ctr->keystream(strlen($plaintext)) ^ $plaintext;

        $tag = $this->computeTag($ciphertext, $j0, $aad);

        return ['ciphertext' => $ciphertext, 'tag' => $tag];
    }

    public function decrypt(string $ciphertext, string $iv, string $tag, string $aad = ''): string
    {
        self::assertIv($iv);

        if (!$this->verifyTag($ciphertext, $iv, $tag, $aad)) {
            throw new InvalidArgumentException(
                'GCM authentication tag verification failed. ' .
                'The ciphertext, IV, tag or AAD has been altered.'
            );
        }

        $j0 = self::buildJ0($iv);
        $ctr = new CTRMode($this->cipher, CTRMode::inc32($j0));

        return $ctr->keystream(strlen($ciphertext)) ^ $ciphertext;
    }


    public function generateAuthenticationTag(string $ciphertext, string $iv, string $aad = ''): string
    {
        self::assertIv($iv);

        return $this->computeTag($ciphertext, self::buildJ0($iv), $aad);
    }


    public function verifyTag(string $ciphertext, string $iv, string $tag, string $aad = ''): bool
    {
        self::assertIv($iv);

        if (strlen($tag) !== $this->tagLength) {
            return false;
        }

        $expected = $this->computeTag($ciphertext, self::buildJ0($iv), $aad);

        // Constant-time comparison.
        return hash_equals($expected, $tag);
    }

   
    private function computeTag(string $ciphertext, string $j0, string $aad): string
    {
        $ghash = new GHASH($this->hashSubkey);
        $ghash->absorbAad($aad);
        $ghash->absorbCiphertext($ciphertext);
        $hash = $ghash->finalize();

        $tagMask = $this->cipher->encrypt($j0); // E_K(J0)

        return substr($hash ^ $tagMask, 0, $this->tagLength);
    }
}
