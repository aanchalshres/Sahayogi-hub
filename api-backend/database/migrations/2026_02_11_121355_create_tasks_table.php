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
        Schema::create('tasks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('ngo_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('category_id')->constrained('categories');
    $table->string('title');
    $table->text('description')->nullable();
    $table->enum('selection_logic', ['FCFS', 'Weighted']);
    $table->jsonb('required_skills')->nullable(); // optional if not using task_skills table
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
