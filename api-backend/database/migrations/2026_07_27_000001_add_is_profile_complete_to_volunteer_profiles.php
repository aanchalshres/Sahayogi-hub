<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('volunteer_profiles', function (Blueprint $table) {
            $table->boolean('is_profile_complete')->default(false)->after('availability');
        });
    }

    public function down(): void
    {
        Schema::table('volunteer_profiles', function (Blueprint $table) {
            $table->dropColumn('is_profile_complete');
        });
    }
};
