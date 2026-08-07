<?php

namespace App\Services\Crypto;

final class CTRMode
{
    /** @var AES256 block cipher instance */
    private AES256 $cipher;

    /** @var string current 16-byte counter block */
    private string $counterBlock;

    /**
     * @param string $counterBlock initial 16-byte counter block (J0 for GCM)
     */
    public function __construct(AES256 $cipher, string $counterBlock)
    {
        $this->cipher = $cipher;
        $this->counterBlock = $counterBlock;
    }

    /**
     * Increment the last 32 bits of a counter block (mod 2^32), leaving
     * the remaining 96 bits untouched. This is the GCM inc32 function.
     *
     * Time complexity: O(16). Space complexity: O(1).
     */
    public static function inc32(string $block): string
    {
        if (strlen($block) !== 16) {
            throw new \InvalidArgumentException('Counter blocks are 16 bytes.');
        }

        $words = unpack('N4', $block);

        $last = ($words[4] + 1) & 0xFFFFFFFF;

        return substr($block, 0, 12) . pack('N', $last);
    }

    /**
     * Produce $length bytes of keystream, advancing the counter after
     * every full 16-byte block.
     *
     * Calling this repeatedly (e.g. once per file chunk) yields the
     * same keystream as a single call with the concatenated length,
     * which is what makes chunked streaming encryption safe.
     *
     * Time complexity: O(ceil(length / 16)) AES block calls.
     * Space complexity: O(length) output plus O(1) buffer.
     */
    public function keystream(int $length): string
    {
        if ($length < 0) {
            throw new \InvalidArgumentException('Keystream length cannot be negative.');
        }

        $keystream = '';

        while ($length > 0) {
            $block = $this->cipher->encrypt($this->counterBlock);

            $take = min(16, $length);
            $keystream .= substr($block, 0, $take);

            $this->counterBlock = self::inc32($this->counterBlock);
            $length -= $take;
        }

        return $keystream;
    }

    /**
     * Encrypt/decrypt a piece of data with the current keystream state.
     *
     * CTR is symmetric: applying the function twice returns the input.
     *
     * Time complexity: O(n) where n = strlen($data) (one AES call per
     * 16 bytes). Space complexity: O(n).
     */
    public function crypt(string $data): string
    {
        return $data ^ $this->keystream(strlen($data));
    }
}
