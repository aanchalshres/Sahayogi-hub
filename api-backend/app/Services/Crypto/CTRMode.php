<?php

namespace App\Services\Crypto;

final class CTRMode
{
    /** @var AES256 block cipher instance */
    private AES256 $cipher;


    private string $counterBlock;

    public function __construct(AES256 $cipher, string $counterBlock)
    {
        $this->cipher = $cipher;
        $this->counterBlock = $counterBlock;
    }


    public static function inc32(string $block): string
    {
        if (strlen($block) !== 16) {
            throw new \InvalidArgumentException('Counter blocks are 16 bytes.');
        }

        $words = unpack('N4', $block);

        $last = ($words[4] + 1) & 0xFFFFFFFF;

        return substr($block, 0, 12) . pack('N', $last);
    }

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


    public function crypt(string $data): string
    {
        return $data ^ $this->keystream(strlen($data));
    }
}
