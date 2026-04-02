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
        // Ensure all NGO profile columns are nullable
        Schema::table('ngo_profiles', function (Blueprint $table) {
            // Change existing columns to nullable if they aren't already
            $table->string('registration_number')->nullable()->change();
            $table->string('office_location')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a safety change, no need to reverse
    }
};
