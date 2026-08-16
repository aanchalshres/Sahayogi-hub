<?php

use App\Services\Crypto\GHASH;

/**
 * Calls the private GHASH::multiply() so we can verify a single 16-byte
 * block product X * H against independent references.
 */
function ghashMultiply(string $hashSubkey, string $block): string
{
    $ghash = new GHASH(hex2bin($hashSubkey));

    $method = (new ReflectionClass(GHASH::class))->getMethod('multiply');
    $method->setAccessible(true);

    return bin2hex($method->invoke($ghash, hex2bin($block)));
}

it('matches the NIST SP 800-38D Y1 example (A * H)', function () {
    /*
     * SP 800-38D Appendix B:
     *   H       = 66e94bd4ef8a2c3b884cfa59ca342b2e (AES-128 subkey for key 0)
     *   X1 = A1 = 0388dace60b6a392f328c2b971b2fe78
     *   Y1 = X1 * H
     */
    expect(ghashMultiply(
        '66e94bd4ef8a2c3b884cfa59ca342b2e',
        '0388dace60b6a392f328c2b971b2fe78'
    ))->toBe('5e2ec746917062882c85b0685353deb7');
});

it('matches the BouncyCastle GHASH reference vector', function () {
    expect(ghashMultiply(
        'ed95f8e164bf3213febc740f0bd9c4af',
        'acbef20579b4b8ebce889bac8732dad7'
    ))->toBe('4db870d37cb75fcb46097c36230d1612');
});

it('matches the NSS X1 reference (C * H)', function () {
    /*
     * NSS/FreeBL GHASH self-test with H = dc95c078... (AES zero-key
     * subkey), X = first 16-byte ciphertext block of the all-zero vector.
     */
    expect(ghashMultiply(
        'dc95c078a2408989ad48a21492842087',
        'cea7403d4d606b6e074ec5d3baf39d18'
    ))->toBe('fd6ab7586e556dba06d69cfe6223b262');
});