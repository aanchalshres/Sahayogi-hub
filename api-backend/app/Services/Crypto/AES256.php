<?php

namespace App\Services\Crypto;

use InvalidArgumentException;

final class AES256
{
    /** AES block size in bytes. */
    private const BLOCK_SIZE = 16;

    /** Number of rounds for AES-256. */
    private const ROUNDS = 14;

    /** @var list<string> 15 round keys of 16 bytes, index 0..14 */
    private array $roundKeys = [];


    private ?array $sBox = null;

    private ?array $inverseSBox = null;


    public function __construct(string $key)
    {
        if (strlen($key) !== 32) {
            throw new InvalidArgumentException(
                'AES-256 requires a 32-byte key, got ' . strlen($key) . ' bytes.'
            );
        }

        $this->roundKeys = KeyExpansion::wordsToRoundKeys(
            KeyExpansion::expandKey($key)
        );
        $this->sBox = KeyExpansion::sBox();
        $this->inverseSBox = KeyExpansion::inverseSBox();
    }

    /**
     * Convenience method: encrypt a single 16-byte block with a key.
     */
    public static function encryptBlock(string $block, string $key): string
    {
        return (new self($key))->encrypt($block);
    }


    public static function decryptBlock(string $block, string $key): string
    {
        return (new self($key))->decrypt($block);
    }

    public function encrypt(string $block): string
    {
        if (strlen($block) !== self::BLOCK_SIZE) {
            throw new InvalidArgumentException(
                'AES operates on 16-byte blocks, got ' . strlen($block) . ' bytes.'
            );
        }

        /** @var array<int, int> $state flat 16-byte state in column-major order */
        $state = array_values(unpack('C16', $block));

        $this->addRoundKey($state, 0);

        for ($round = 1; $round <= self::ROUNDS - 1; $round++) {
            $this->subBytes($state);
            $this->shiftRows($state);
            $this->mixColumns($state);
            $this->addRoundKey($state, $round);
        }

        // Final round: no MixColumns.
        $this->subBytes($state);
        $this->shiftRows($state);
        $this->addRoundKey($state, self::ROUNDS);

        return pack('C16', ...$state);
    }

    
    public function decrypt(string $block): string
    {
        if (strlen($block) !== self::BLOCK_SIZE) {
            throw new InvalidArgumentException(
                'AES operates on 16-byte blocks, got ' . strlen($block) . ' bytes.'
            );
        }

        /** @var array<int, int> $state flat 16-byte state in column-major order */
        $state = array_values(unpack('C16', $block));

        // Start with the final round key.
        $this->addRoundKey($state, self::ROUNDS);

        for ($round = self::ROUNDS - 1; $round >= 1; $round--) {
            $this->inverseShiftRows($state);
            $this->inverseSubBytes($state);
            $this->addRoundKey($state, $round);
            $this->inverseMixColumns($state);
        }

        // Final inverse round: no inverse MixColumns.
        $this->inverseShiftRows($state);
        $this->inverseSubBytes($state);
        $this->addRoundKey($state, 0);

        return pack('C16', ...$state);
    }

    /**
     * SubBytes: replace every byte of the state with S-Box(state byte).
     *
     * The S-Box is a non-linear byte substitution built from the
     * multiplicative inverse in GF(2^8) plus an affine transform.
     *
     * Time complexity: O(16) per block. Space: O(1).
     */
    private function subBytes(array &$state): void
    {
        foreach ($state as $index => $byte) {
            $state[$index] = $this->sBox[$byte];
        }
    }

    /**
     * InvSubBytes: S-Box^(-1) applied to every state byte.
     */
    private function inverseSubBytes(array &$state): void
    {
        foreach ($state as $index => $byte) {
            $state[$index] = $this->inverseSBox[$byte];
        }
    }

    /**
     * ShiftRows: cyclically shift row r of the state left by r bytes.
     *
     * With the column-major layout, row r occupies indices
     * [r, r+4, r+8, r+12]. A byte in row r, column c moves to column
     * (c - r) mod 4, i.e. new(r, c) = old(r, (c + r) mod 4).
     *
     * Time complexity: O(16) per block. Space: O(16).
     */
    private function shiftRows(array &$state): void
    {
        $shifted = array_fill(0, 16, 0);

        // The FIPS-197 recurrence for the ShiftRows transformation,
        // new(r,c) = old(r, (c + r) mod 4). With a column-major flat
        // layout, byte (r, c) lives at flat index c*4 + r, so:
        //
        //     shifted[c*4 + r] = state[ ((c + r) mod 4)*4 + r ]
        $shifted = array_fill(0, 16, 0);

        for ($column = 0; $column < 4; $column++) {
            for ($row = 0; $row < 4; $row++) {
                $shifted[$column * 4 + $row] =
                    $state[(($column + $row) & 3) * 4 + $row];
            }
        }

        $state = $shifted;
    }

    /**
     * InvShiftRows: cyclically shift row r of the state right by r bytes,
     * i.e. new(r,c) = old(r, (c - r) mod 4).
     */
    private function inverseShiftRows(array &$state): void
    {
        $shifted = array_fill(0, 16, 0);

        for ($column = 0; $column < 4; $column++) {
            for ($row = 0; $row < 4; $row++) {
                $shifted[$column * 4 + $row] =
                    $state[(($column - $row + 4) & 3) * 4 + $row];
            }
        }

        $state = $shifted;
    }

    /**
     * MixColumns: multiply each column of the state by the fixed matrix
     *
     *     [ 2 3 1 1 ]
     *     [ 1 2 3 1 ]
     *     [ 1 1 2 3 ]
     *     [ 3 1 1 2 ]
     *
     * over GF(2^8). This is the diffusion step: a change in one byte of
     * a column affects the whole column after the round.
     *
     * Time complexity: O(4 columns * 4 bytes) = O(16) per block.
     * Space complexity: O(1).
     */
    private function mixColumns(array &$state): void
    {
        for ($column = 0; $column < 4; $column++) {
            $base = $column * 4;

            $a0 = $state[$base];
            $a1 = $state[$base + 1];
            $a2 = $state[$base + 2];
            $a3 = $state[$base + 3];

            $state[$base] = KeyExpansion::mul8($a0, 2)
                ^ KeyExpansion::mul8($a1, 3) ^ $a2 ^ $a3;
            $state[$base + 1] = $a0
                ^ KeyExpansion::mul8($a1, 2) ^ KeyExpansion::mul8($a2, 3) ^ $a3;
            $state[$base + 2] = $a0 ^ $a1
                ^ KeyExpansion::mul8($a2, 2) ^ KeyExpansion::mul8($a3, 3);
            $state[$base + 3] = KeyExpansion::mul8($a0, 3) ^ $a1 ^ $a2
                ^ KeyExpansion::mul8($a3, 2);
        }
    }

    /**
     * InvMixColumns: multiply each column by the inverse matrix
     *
     *     [ 14 11 13  9 ]
     *     [  9 14 11 13 ]
     *     [ 13  9 14 11 ]
     *     [ 11 13  9 14 ]
     *
     * over GF(2^8).
     */
    private function inverseMixColumns(array &$state): void
    {
        for ($column = 0; $column < 4; $column++) {
            $base = $column * 4;

            $a0 = $state[$base];
            $a1 = $state[$base + 1];
            $a2 = $state[$base + 2];
            $a3 = $state[$base + 3];

            $state[$base] = KeyExpansion::mul8($a0, 14)
                ^ KeyExpansion::mul8($a1, 11)
                ^ KeyExpansion::mul8($a2, 13)
                ^ KeyExpansion::mul8($a3, 9);
            $state[$base + 1] = KeyExpansion::mul8($a0, 9)
                ^ KeyExpansion::mul8($a1, 14)
                ^ KeyExpansion::mul8($a2, 11)
                ^ KeyExpansion::mul8($a3, 13);
            $state[$base + 2] = KeyExpansion::mul8($a0, 13)
                ^ KeyExpansion::mul8($a1, 9)
                ^ KeyExpansion::mul8($a2, 14)
                ^ KeyExpansion::mul8($a3, 11);
            $state[$base + 3] = KeyExpansion::mul8($a0, 11)
                ^ KeyExpansion::mul8($a1, 13)
                ^ KeyExpansion::mul8($a2, 9)
                ^ KeyExpansion::mul8($a3, 14);
        }
    }

    /**
     * AddRoundKey: XOR the state with round key $round (16 bytes).
     *
     * This is the only operation that uses the secret key material, and
     * it is applied at the start and end of every round.
     */
    private function addRoundKey(array &$state, int $round): void
    {
        $key = $this->roundKeys[$round];

        for ($i = 0; $i < 16; $i++) {
            $state[$i] ^= ord($key[$i]);
        }
    }
}
