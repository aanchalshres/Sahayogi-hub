<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Fill NULL values with defaults before making columns non-nullable
        DB::table('users')->whereNull('phone')->update(['phone' => '']);
        DB::table('volunteer_profiles')->whereNull('primary_location')->update(['primary_location' => '']);
        DB::table('ngo_profiles')->whereNull('registration_number')->update(['registration_number' => '']);
        DB::table('ngo_profiles')->whereNull('office_location')->update(['office_location' => '']);
        DB::table('ngo_profiles')->whereNull('pan_number')->update(['pan_number' => '']);
        DB::table('ngo_profiles')->whereNull('registration_file_path')->update(['registration_file_path' => '']);
        DB::table('ngo_profiles')->whereNull('pan_file_path')->update(['pan_file_path' => '']);

        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable(false)->change();
        });

        Schema::table('volunteer_profiles', function (Blueprint $table) {
            $table->string('primary_location')->nullable(false)->change();
        });

        Schema::table('ngo_profiles', function (Blueprint $table) {
            $table->string('registration_number')->nullable(false)->change();
            $table->string('office_location')->nullable(false)->change();
            $table->string('pan_number')->nullable(false)->change();
            $table->string('registration_file_path')->nullable(false)->change();
            $table->string('pan_file_path')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->change();
        });

        Schema::table('volunteer_profiles', function (Blueprint $table) {
            $table->string('primary_location')->nullable()->change();
        });

        Schema::table('ngo_profiles', function (Blueprint $table) {
            $table->string('registration_number')->nullable()->change();
            $table->string('office_location')->nullable()->change();
            $table->string('pan_number')->nullable()->change();
            $table->string('registration_file_path')->nullable()->change();
            $table->string('pan_file_path')->nullable()->change();
        });
    }
};

