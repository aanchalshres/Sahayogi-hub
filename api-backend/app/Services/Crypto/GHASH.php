<?php

namespace App\Services\Crypto;

final class GHASH
{
    /** 16-byte binary string of the hash subkey H = AES_K(0^128). */
    private string $hashSubkey;


    private array $tables = [];

    /** Running GHASH accumulator Y (16-byte binary string). */
    private string $y;

    /** Any AAD still waiting for a full block (streamed input). */
    private string $pending = '';

    /** Accumulated AAD byte length (for the lengths block). */
    private int $totalAadBytes = 0;

    /** Accumulated ciphertext byte length (for the lengths block). */
    private int $totalCipherBytes = 0;

    /**
     * @param string $hashSubkey 16-byte H = AES_K(0^128)
     */
    public function __construct(string $hashSubkey)
    {
        if (strlen($hashSubkey) !== 16) {
            throw new \InvalidArgumentException('GHASH subkey must be 16 bytes.');
        }

        $this->hashSubkey = $hashSubkey;
        $this->y = str_repeat("\0", 16);
        $this->tables = $this->buildTables($hashSubkey);
    }


    private function buildTables(string $subkey): array
    {
        $tables = [];

        // Per NIST SP 800-38D the bit string of a block maps to a
        // polynomial with the FIRST bit as the constant term, so the
        // coefficients run "little endian" through the block. The
        // verified arithmetic is therefore: read bits from the LSB end,
        // shift blocks to the RIGHT, and on overflow reduce with the
        // R || 1 constant (0xE1 in the first byte).
        //
        // Table for byte position $position holds H * u^(8*$position)
        // pre-multiplied by every possible byte value.
        $current = $subkey; // H * u^0

        for ($position = 0; $position < 16; $position++) {
            $weights = [7 => $current]; // bit 7 -> coefficient u^0

            for ($t = 6; $t >= 0; $t--) {
                $weights[$t] = $this->shiftRight1($weights[$t + 1]);
            }

            $table = array_fill(0, 256, str_repeat("\0", 16));

            for ($byte = 1; $byte < 256; $byte++) {
                for ($t = 0; $t < 8; $t++) {
                    if ($byte & (1 << $t)) {
                        $table[$byte] ^= $weights[$t];
                    }
                }
            }

            $tables[$position] = $table;

            // Next byte position: multiply the weight by u^8.
            if ($position < 15) {
                $current = $this->shiftRight1($this->shiftRight1($this->shiftRight1($this->shiftRight1(
                    $this->shiftRight1($this->shiftRight1($this->shiftRight1($this->shiftRight1($current))))
                ))));
            }
        }

        return $tables;
    }


    /**
     * Multiply the block by u in GF(2^128) using the SP 800-38D
     * representation: shift the bit string right by one; if the least
     * significant bit (coefficient of u^127) was set, reduce the
     * resulting u^128 term by XORing 0xE1 into the first byte.
     */
    private function shiftRight1(string $block): string
    {
        $words = array_values(unpack('N4', $block));

        $carry = $words[3] & 1;

        $shifted = pack(
            'N4',
            ($words[0] >> 1) & 0xFFFFFFFF,
            (($words[1] >> 1) | (($words[0] & 1) << 31)) & 0xFFFFFFFF,
            (($words[2] >> 1) | (($words[1] & 1) << 31)) & 0xFFFFFFFF,
            (($words[3] >> 1) | (($words[2] & 1) << 31)) & 0xFFFFFFFF
        );

        if ($carry) {
            // u^128 = u^0 + u^1 + u^2 + u^7, i.e. byte value 0xE1
            // (0b11100001) at the first byte's bits 7..0.
            $shifted = chr(ord($shifted[0]) ^ 0xE1) . substr($shifted, 1);
        }

        return $shifted;
    }


    private function multiply(string $block): string
    {
        if (strlen($block) !== 16) {
            throw new \InvalidArgumentException('GHASH blocks are 16 bytes.');
        }

        $result = str_repeat("\0", 16);

        for ($position = 0; $position < 16; $position++) {
            $byte = ord($block[$position]);
            $result ^= $this->tables[$position][$byte];
        }

        return $result;
    }


    public function absorbAad(string $aad): static
    {
        $this->totalAadBytes = strlen($aad);

        $blocks = $aad . str_repeat("\0", (16 - strlen($aad) % 16) % 16);

        for ($offset = 0; $offset < strlen($blocks); $offset += 16) {
            $this->absorbSingle(substr($blocks, $offset, 16));
        }

        return $this;
    }


    public function absorbCiphertext(string $ciphertext): static
    {
        $this->totalCipherBytes += strlen($ciphertext);

        $buffer = $this->pending . $ciphertext;
        $fullLength = strlen($buffer) - (strlen($buffer) % 16);

        for ($offset = 0; $offset < $fullLength; $offset += 16) {
            $this->absorbSingle(substr($buffer, $offset, 16));
        }

        $this->pending = substr($buffer, $fullLength);

        return $this;
    }

    private function absorbSingle(string $block): void
    {
        $this->y = $this->multiply($this->y ^ $block);
    }


    public function finalize(): string
    {
        // Pad the trailing partial ciphertext block, if any.
        if ($this->pending !== '') {
            $this->absorbSingle($this->pending . str_repeat("\0", 16 - strlen($this->pending)));
            $this->pending = '';
        }

        // 64-bit big-endian bit lengths.
        [$aadHigh, $aadLow] = $this->bitLength64($this->totalAadBytes);
        [$cipherHigh, $cipherLow] = $this->bitLength64($this->totalCipherBytes);

        $lengthsBlock = pack(
            'N4',
            $aadHigh, $aadLow, $cipherHigh, $cipherLow
        );

        $this->absorbSingle($lengthsBlock);

        return $this->y;
    }


    private function bitLength64(int $bytes): array
    {
        $bits = $bytes * 8;
        $high = intdiv($bits, 4294967296);

        return [$high, $bits & 0xFFFFFFFF];
    }
}
