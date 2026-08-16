<?php

use App\Services\Crypto\AES256;

it('matches the FIPS-197 AES-256 encryption known-answer test', function () {
    $cipher = new AES256(
        hex2bin('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f')
    );

    $ciphertext = $cipher->encrypt(hex2bin('00112233445566778899aabbccddeeff'));

    expect(bin2hex($ciphertext))->toBe('8ea2b7ca516745bfeafc49904b496089');
});

it('decrypts back to the original plaintext', function () {
    $cipher = new AES256(
        hex2bin('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f')
    );

    $plaintext = hex2bin('00112233445566778899aabbccddeeff');
    $ciphertext = $cipher->encrypt($plaintext);

    expect($cipher->decrypt($ciphertext))->toBe($plaintext);
});

it('is invertible across repeated round-trips', function () {
    $cipher = new AES256(random_bytes(32));
    $plaintext = random_bytes(16);

    $ciphertext = $plaintext;
    for ($i = 0; $i < 8; $i++) {
        $ciphertext = $cipher->encrypt($ciphertext);
    }

    $decrypted = $ciphertext;
    for ($i = 0; $i < 8; $i++) {
        $decrypted = $cipher->decrypt($decrypted);
    }

    expect($decrypted)->toBe($plaintext);
});