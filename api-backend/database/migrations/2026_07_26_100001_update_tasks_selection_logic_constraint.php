<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (! $this->isPostgres()) {
            return;
        }

        DB::statement('ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_selection_logic_check');
        DB::statement("ALTER TABLE tasks ADD CONSTRAINT tasks_selection_logic_check CHECK (selection_logic IN ('FCFS', 'Weighted', 'recommendation', 'manual', 'auto_accept'))");
    }

    public function down(): void
    {
        if (! $this->isPostgres()) {
            return;
        }

        DB::statement('ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_selection_logic_check');
        DB::statement("ALTER TABLE tasks ADD CONSTRAINT tasks_selection_logic_check CHECK (selection_logic IN ('FCFS', 'Weighted', 'recommendation'))");
    }

    private function isPostgres(): bool
    {
        return DB::connection()->getDriverName() === 'pgsql';
    }
};
