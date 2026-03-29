<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ngo_profiles', function (Blueprint $table) {
            $table->string('pan_number')->nullable();
            $table->string('registration_file_path')->nullable();
            $table->string('pan_file_path')->nullable();
            $table->string('letterhead_file_path')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ngo_profiles', function (Blueprint $table) {
            $table->dropColumn(['pan_number', 'registration_file_path', 'pan_file_path', 'letterhead_file_path']);
        });
    }
};
