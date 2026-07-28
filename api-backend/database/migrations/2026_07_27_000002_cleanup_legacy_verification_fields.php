<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('identity_verifications', function (Blueprint $table) {
            $table->dropColumn(['face_match_score', 'liveness_score']);
        });

        Schema::table('identity_selfies', function (Blueprint $table) {
            $table->dropColumn([
                'face_detection_status',
                'faces_detected',
                'liveness_result',
                'liveness_status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('identity_verifications', function (Blueprint $table) {
            $table->float('face_match_score')->nullable()->after('ocr_score');
            $table->float('liveness_score')->nullable()->after('face_match_score');
        });

        Schema::table('identity_selfies', function (Blueprint $table) {
            $table->string('face_detection_status')->nullable()->after('file_size');
            $table->integer('faces_detected')->nullable()->after('face_detection_status');
            $table->json('liveness_result')->nullable()->after('is_blurry');
            $table->string('liveness_status')->default('pending')->after('liveness_result');
        });
    }
};
