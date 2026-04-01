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
        Schema::table('users', function (Blueprint $table) {
            // Drop the old enum constraint
            DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");

            // Add the new constraint with 'admin' role included
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('volunteer', 'ngo', 'admin'))");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Revert to original constraint without 'admin'
            DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('volunteer', 'ngo'))");
        });
    }
};
