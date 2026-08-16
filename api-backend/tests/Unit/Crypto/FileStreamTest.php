<?php

use App\Services\Crypto\FileDecryptor;
use App\Services\Crypto\FileEncryptor;
use App\Services\Crypto\GCM;

function makeTempDir(): string
{
    $dir = sys_get_temp_dir() . '/encrypted-doc-tests-' . bin2hex(random_bytes(4));
    mkdir($dir, 0777, true);

    return $dir;
}

afterEach(function () {
    foreach (glob(sys_get_temp_dir() . '/encrypted-doc-tests-*') ?: [] as $dir) {
        foreach (glob("$dir/*") ?: [] as $file) {
            @unlink($file);
        }
        @rmdir($dir);
    }
});

it('round-trips a file through streaming encryption', function () {
    $dir = makeTempDir();
    $plain = "$dir/plain.txt";
    $cipher = "$dir/plain.txt.enc";
    $decrypted = "$dir/decrypted.txt";

    $contents = random_bytes(150_000);
    file_put_contents($plain, $contents);

    $key = random_bytes(32);

    $encryptor = new FileEncryptor();
    $envelope = $encryptor->encrypt($plain, $cipher, $key, aad: 'ctx');

    $decryptor = new FileDecryptor();
    $result = $decryptor->decrypt($cipher, $decrypted, $key, $envelope['iv'], $envelope['tag'], 'ctx');

    expect($result)->toBeTrue();
    expect(file_get_contents($decrypted))->toEqual($contents);
});

it('produces the same tag as the in-memory GCM over the whole file', function () {
    $dir = makeTempDir();
    $plain = "$dir/plain.bin";
    $cipher = "$dir/plain.bin.enc";

    $key = random_bytes(32);
    $iv = random_bytes(12);
    $aad = 'aad';

    $contents = random_bytes(200_000);
    file_put_contents($plain, $contents);

    $envelope = (new FileEncryptor())->encrypt($plain, $cipher, $key, $iv, $aad);

    $gcm = new GCM($key);
    $memoryTag = $gcm->generateAuthenticationTag(file_get_contents($cipher), $iv, $aad);

    expect(bin2hex($envelope['tag']))->toBe(bin2hex($memoryTag));
});

test('rejects a tampered ciphertext file', function () {
    $dir = makeTempDir();
    $plain = "$dir/plain.bin";
    $cipher = "$dir/plain.bin.enc";

    $key = random_bytes(32);
    file_put_contents($plain, random_bytes(50_000));

    $envelope = (new FileEncryptor())->encrypt($plain, $cipher, $key);

    $handle = fopen($cipher, 'r+b');
    fseek($handle, 10_000);
    $byte = fgetc($handle);
    fseek($handle, 10_000);
    fwrite($handle, $byte ^ "\x01");
    fclose($handle);

    $decrypted = "$dir/decrypted.bin";
    expect(fn () => (new FileDecryptor())->decrypt($cipher, $decrypted, $key, $envelope['iv'], $envelope['tag']))
        ->toThrow(\InvalidArgumentException::class);

    expect(file_exists($decrypted))->toBeFalse();
});

it('rejects a mismatch between the metadata AAD and the stored tag', function () {
    $dir = makeTempDir();
    $plain = "$dir/plain.bin";
    $cipher = "$dir/plain.bin.enc";

    $key = random_bytes(32);
    file_put_contents($plain, 'some contents');

    $envelope = (new FileEncryptor())->encrypt($plain, $cipher, $key, aad: 'original-aad');

    $decrypted = "$dir/decrypted.bin";
    expect(fn () => (new FileDecryptor())->decrypt($cipher, $decrypted, $key, $envelope['iv'], $envelope['tag'], 'other-aad'))
        ->toThrow(\InvalidArgumentException::class);
});

it('encrypts an empty file and verifies the empty tag', function () {
    $dir = makeTempDir();
    $plain = "$dir/empty.txt";
    $cipher = "$dir/empty.txt.enc";
    file_put_contents($plain, '');

    $key = random_bytes(32);
    $envelope = (new FileEncryptor())->encrypt($plain, $cipher, $key);

    $gcm = new GCM($key);
    expect(bin2hex($gcm->generateAuthenticationTag('', $envelope['iv'])))
        ->toBe(bin2hex($envelope['tag']));
});