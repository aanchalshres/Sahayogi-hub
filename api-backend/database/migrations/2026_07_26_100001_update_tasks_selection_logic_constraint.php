<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_selection_logic_check');
        DB::statement("ALTER TABLE tasks ADD CONSTRAINT tasks_selection_logic_check CHECK (selection_logic IN ('FCFS', 'Weighted', 'recommendation', 'manual', 'auto_accept'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_selection_logic_check');
        DB::statement("ALTER TABLE tasks ADD CONSTRAINT tasks_selection_logic_check CHECK (selection_logic IN ('FCFS', 'Weighted', 'recommendation'))");
    }
};
