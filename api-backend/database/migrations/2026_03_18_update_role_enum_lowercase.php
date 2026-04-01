<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Drop existing constraint FIRST
        DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");

        // Step 2: Now convert existing data to lowercase (constraint is gone, so this works)
        DB::statement("UPDATE users SET role = LOWER(role)");
        DB::statement("ALTER TABLE users DROP COLUMN role");
        DB::statement("ALTER TABLE users ADD COLUMN role VARCHAR(255) CHECK (role IN ('volunteer', 'ngo', 'admin'))");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users DROP COLUMN role");
        DB::statement("ALTER TABLE users ADD COLUMN role VARCHAR(255) CHECK (role IN ('volunteer', 'ngo', 'admin'))");
    }
};
