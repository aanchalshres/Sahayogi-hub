<?php

use App\Services\Crypto\GCM;

use function PHPUnit\Framework\assertEquals;
use function PHPUnit\Framework\assertSame;
use function PHPUnit\Framework\assertTrue;

/**
 * Verifies our pure-PHP GCM against the NIST AES-GCM known-answer
 * vectors (all-zero key and IV) that were cross-checked against
 * OpenSSL during development.
 */
function nistGcm(string $key, string $iv, string $aad, string $pt, string $expCt, string $expTag): array
{
    $gcm = new GCM(hex2bin($key));
    $result = $gcm->encrypt(hex2bin($pt), hex2bin($iv), hex2bin($aad));

    assertSame(hex2bin($expCt), $result['ciphertext'], 'ciphertext mismatch');
    assertSame(hex2bin($expTag), $result['tag'], 'tag mismatch');

    return $result;
}

it('encrypts the NIST all-zero empty plaintext vector (TC1)', function () {
    $zeroKey = str_repeat('0', 64);
    $zeroIv = str_repeat('0', 24);

    nistGcm(
        $zeroKey,
        $zeroIv,
        '',
        '',
        '',
        '530f8afbc74536b9a963b4f1c4cb738b'
    );
});

it('encrypts the NIST all-zero 16-byte vector (TC2)', function () {
    $zeroKey = str_repeat('0', 64);
    $zeroIv = str_repeat('0', 24);

    nistGcm(
        $zeroKey,
        $zeroIv,
        '',
        str_repeat('0', 32),
        'cea7403d4d606b6e074ec5d3baf39d18',
        'd0d1c8a799996bf0265b98b5d48ab919'
    );
});

it('encrypts the NIST all-zero 64-byte vector (TC3)', function () {
    $zeroKey = str_repeat('0', 64);
    $zeroIv = str_repeat('0', 24);

    nistGcm(
        $zeroKey,
        $zeroIv,
        '',
        str_repeat('0', 128),
        'cea7403d4d606b6e074ec5d3baf39d18' .
        '726003ca37a62a74d1a2f58e7506358e' .
        'dd4ab1284d4ae17b41e85924470c36f7' .
        '4741cbe181bb7f30617c1de3ab0c3a1f',
        '5d5c0cd0c7b0138ac868f227d053cd0b'
    );
});

it('decrypts and verifies the NIST vectors', function () {
    $zeroKey = str_repeat('0', 64);
    $zeroIv = str_repeat('0', 24);
    $gcm = new GCM(hex2bin($zeroKey));

    [$ct, $tag] = array_values($gcm->encrypt(str_repeat("\0", 16), hex2bin($zeroIv)));
    $plain = $gcm->decrypt($ct, hex2bin($zeroIv), $tag);

    assertSame(str_repeat("\0", 16), $plain);
});

it('matches OpenSSL for the NIST TC2 vector', function () {
    $key = str_repeat("\0", 32);
    $iv = str_repeat("\0", 12);
    $pt = str_repeat("\0", 16);

    $tag = '';
    $opensslCt = openssl_encrypt($pt, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag, '', 16);

    $gcm = new GCM($key);
    $result = $gcm->encrypt($pt, $iv);

    assertSame(bin2hex($opensslCt), bin2hex($result['ciphertext']));
    assertSame(bin2hex($tag), bin2hex($result['tag']));
});

it('rejects tampered ciphertext and tampered AAD', function () {
    $key = random_bytes(32);
    $iv = random_bytes(12);
    $aad = 'some-ngo-context';
    $gcm = new GCM($key);

    $plaintext = random_bytes(100);
    $result = $gcm->encrypt($plaintext, $iv, $aad);

    $tamperedCiphertext = $result['ciphertext'];
    $tamperedCiphertext[5] = chr(ord($tamperedCiphertext[5]) ^ 0x01);

    expect(fn () => $gcm->decrypt($tamperedCiphertext, $iv, $result['tag'], $aad))
        ->toThrow(\InvalidArgumentException::class);

    expect(fn () => $gcm->decrypt($result['ciphertext'], $iv, $result['tag'], $aad . 'x'))
        ->toThrow(\InvalidArgumentException::class);
});

it('rejects a wrong-length tag', function () {
    $key = random_bytes(32);
    $iv = random_bytes(12);
    $gcm = new GCM($key);

    $result = $gcm->encrypt('hello', $iv);

    expect($gcm->verifyTag($result['ciphertext'], $iv, substr($result['tag'], 0, 8)))
        ->toBeFalse();
});

it('round-trips arbitrary lengths and AAD combos', function () {
    $gcm = new GCM(random_bytes(32));
    $iv = random_bytes(12);

    foreach ([0, 1, 15, 16, 17, 1000] as $length) {
        $pt = $length === 0 ? '' : random_bytes($length);
        $aad = $length % 3 === 0 ? '' : random_bytes(20);

        $result = $gcm->encrypt($pt, $iv, $aad);
        $decrypted = $gcm->decrypt($result['ciphertext'], $iv, $result['tag'], $aad);

        assertTrue(hash_equals($pt, $decrypted), "round-trip failed for length $length");
        assertEquals(strlen($pt), strlen($decrypted));
    }
});