<?php

namespace App\Services\Crypto;

use InvalidArgumentException;


final class KeyExpansion
{

    private const RCON = [
        0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1B, 0x36,
    ];

    private static ?array $sBox = null;

    private static ?array $inverseSBox = null;


    public static function mul8(int $a, int $b): int
    {
        $product = 0;

        for ($i = 0; $i < 8; $i++) {
            // If the current LSB of $b is set, XOR $a into the product.
            if (($b & 1) !== 0) {
                $product ^= $a;
            }

            // Check whether a bit would overflow out of the byte.
            $overflow = $a & 0x80;

            // Shift $a left one position inside the byte.
            $a = ($a << 1) & 0xFF;

            // Reduce: XOR the irreducible polynomial (0x1B) when the
            // degree exceeded 7.
            if ($overflow !== 0) {
                $a ^= 0x1B;
            }

            $b >>= 1;
        }

        return $product;
    }


    public static function inv8(int $byte): int
    {
        if ($byte === 0) {
            return 0; // AES defines the inverse of 0 as 0.
        }

        $result = 1;
        $base = $byte;
        $exponent = 254;

        while ($exponent > 0) {
            if (($exponent & 1) !== 0) {
                $result = self::mul8($result, $base);
            }

            $base = self::mul8($base, $base);
            $exponent >>= 1;
        }

        return $result;
    }

        public static function sBox(): array
    {
        if (self::$sBox === null) {
            $sbox = [];
            $inverse = [];

            for ($i = 0; $i < 256; $i++) {
                $y = self::inv8($i);

                // Rotate left by k bits inside a byte.
                $rotate = static fn (int $value, int $k): int =>
                    (($value << $k) | ($value >> (8 - $k))) & 0xFF;

                $substituted = $y
                    ^ $rotate($y, 1)
                    ^ $rotate($y, 2)
                    ^ $rotate($y, 3)
                    ^ $rotate($y, 4)
                    ^ 0x63;

                $sbox[$i] = $substituted;
                $inverse[$substituted] = $i;
            }

            self::$sBox = $sbox;
            self::$inverseSBox = $inverse;
        }

        return self::$sBox;
    }

    /**
     * Inverse S-Box, derived by inverting the S-Box mapping.
     *
     * @return array<int, int> byte -> substituted byte
     */
    public static function inverseSBox(): array
    {
        if (self::$inverseSBox === null) {
            // Force table construction.
            self::sBox();
        }

        return self::$inverseSBox;
    }


    private static function rotWord(int $word): int
    {
        return (($word << 8) | ($word >> 24)) & 0xFFFFFFFF;
    }


    private static function subWord(int $word): int
    {
        $sbox = self::sBox();

        $result = 0;
        $result |= $sbox[($word >> 24) & 0xFF] << 24;
        $result |= $sbox[($word >> 16) & 0xFF] << 16;
        $result |= $sbox[($word >> 8) & 0xFF] << 8;
        $result |= $sbox[$word & 0xFF];

        return $result;
    }

        public static function expandKey(string $key): array
    {
        if (strlen($key) !== 32) {
            throw new InvalidArgumentException(
                'AES-256 requires a 32-byte key, got ' . strlen($key) . ' bytes.'
            );
        }

        $words = [];

        // The first 8 words are the key itself.
        foreach (unpack('N8', $key) as $word) {
            $words[] = $word;
        }

        $rconIndex = 0;

        for ($i = 8; $i < 60; $i++) {
            $temp = $words[$i - 1];

            if ($i % 8 === 0) {
                // Every 8th word: g() = SubWord(RotWord(temp)) XOR Rcon.
                $temp = self::subWord(self::rotWord($temp))
                    ^ (self::RCON[$rconIndex] << 24);
                $rconIndex++;
            } elseif ($i % 8 === 4) {
                // Mid-block extra SubWord pass (AES-256 only).
                $temp = self::subWord($temp);
            }

            $words[$i] = $words[$i - 8] ^ $temp;
        }

        return $words;
    }

    /**
     * Convenience: turn the 60-word schedule into 15 round keys of
     * 16 bytes each, ready to be XORed with the cipher state.
     *
     * @param list<int> $words 60 words from expandKey()
     *
     * @return list<string> 15 blocks of 16 bytes
     */
    public static function wordsToRoundKeys(array $words): array
    {
        $roundKeys = [];

        for ($round = 0; $round < 15; $round++) {
            $roundKeys[] = pack(
                'N4',
                $words[$round * 4],
                $words[$round * 4 + 1],
                $words[$round * 4 + 2],
                $words[$round * 4 + 3]
            );
        }

        return $roundKeys;
    }
}
