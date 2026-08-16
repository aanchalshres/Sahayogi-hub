<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('encrypted_documents', function (Blueprint $table) {
            $table->id();

            // Owner reference: a short role discriminator ('volunteer'|'ngo')
            // plus the owning user id.
            $table->string('owner_role');
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();

            $table->string('original_filename');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('file_size')->default(0);

            // The AES-256-GCM envelope.
            $table->string('encrypted_file_path');
            $table->string('iv', 64);                 // Base64, 12 bytes
            $table->string('authentication_tag', 64); // Base64, 16 bytes
            $table->string('encryption_algorithm', 32)->default('aes-256-gcm');

            $table->timestamps();

            $table->index(['owner_role', 'owner_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('encrypted_documents');
    }
};