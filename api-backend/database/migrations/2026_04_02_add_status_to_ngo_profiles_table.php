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
            // Add status column with enum values: pending, verified, rejected
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending')->after('is_verified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ngo_profiles', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
