<?php

uses(Tests\TestCase::class);

use App\Models\Category;
use App\Models\NgoProfile;
use App\Models\Skill;
use App\Models\Task;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Authenticate as a verified NGO user and return the ngo profile.
 */
function makeNgoActor(): NgoProfile
{
    $user = User::factory()->create(['role' => 'ngo', 'is_active' => true]);
    $ngo  = NgoProfile::factory()->create([
        'user_id'             => $user->id,
        'verification_status' => 'verified',
    ]);
    Sanctum::actingAs($user, ['*']);
    return $ngo;
}

/**
 * Minimal valid task payload with all dates in the future.
 */
function validPayload(NgoProfile $ngo): array
{
    $category = Category::factory()->create();
    $today    = now()->toDateString();

    return [
        'title'               => 'Beach Cleanup Drive',
        'description'         => 'Help us clean the beach and protect marine life.',
        'category_id'         => $category->id,
        'task_type'           => 'Event',
        'required_volunteers' => 5,
        'start_date'          => now()->addDays(10)->toDateString(),
        'end_date'            => now()->addDays(15)->toDateString(),
        'application_deadline'=> now()->addDays(7)->toDateString(),
        'urgency_level'       => 'Medium',
        'status'              => 'open',
    ];
}

// ──────────────────────────────────────────────────────────────────────────────
// Test 1 — Valid task creation succeeds
// ──────────────────────────────────────────────────────────────────────────────

it('creates a valid task and forces selection_logic to recommendation', function () {
    $ngo     = makeNgoActor();
    $payload = validPayload($ngo);

    $response = $this->postJson('/api/ngo/tasks', $payload);

    $response->assertStatus(201)
             ->assertJsonPath('data.selection_logic', 'recommendation');

    $this->assertDatabaseHas('tasks', [
        'title'           => 'Beach Cleanup Drive',
        'selection_logic' => 'recommendation',
    ]);
});

// ──────────────────────────────────────────────────────────────────────────────
// Test 2 — start_date in the past is rejected
// ──────────────────────────────────────────────────────────────────────────────

it('rejects task creation when start_date is in the past', function () {
    $ngo     = makeNgoActor();
    $payload = validPayload($ngo);
    $payload['start_date'] = now()->subDay()->toDateString();

    $response = $this->postJson('/api/ngo/tasks', $payload);

    $response->assertStatus(422)
             ->assertJsonValidationErrors(['start_date']);
});

// ──────────────────────────────────────────────────────────────────────────────
// Test 3 — application_deadline in the past is rejected
// ──────────────────────────────────────────────────────────────────────────────

it('rejects task creation when application_deadline is in the past', function () {
    $ngo     = makeNgoActor();
    $payload = validPayload($ngo);
    $payload['application_deadline'] = now()->subDay()->toDateString();

    $response = $this->postJson('/api/ngo/tasks', $payload);

    $response->assertStatus(422)
             ->assertJsonValidationErrors(['application_deadline']);
});

// ──────────────────────────────────────────────────────────────────────────────
// Test 4 — application_deadline after start_date is rejected
// ──────────────────────────────────────────────────────────────────────────────

it('rejects task creation when application_deadline is after start_date', function () {
    $ngo     = makeNgoActor();
    $payload = validPayload($ngo);
    $payload['start_date']           = now()->addDays(5)->toDateString();
    $payload['application_deadline'] = now()->addDays(10)->toDateString(); // > start_date

    $response = $this->postJson('/api/ngo/tasks', $payload);

    $response->assertStatus(422)
             ->assertJsonValidationErrors(['application_deadline']);
});

// ──────────────────────────────────────────────────────────────────────────────
// Test 5 — end_date before start_date is rejected
// ──────────────────────────────────────────────────────────────────────────────

it('rejects task creation when end_date is before start_date', function () {
    $ngo     = makeNgoActor();
    $payload = validPayload($ngo);
    $payload['start_date'] = now()->addDays(10)->toDateString();
    $payload['end_date']   = now()->addDays(5)->toDateString(); // before start

    $response = $this->postJson('/api/ngo/tasks', $payload);

    $response->assertStatus(422)
             ->assertJsonValidationErrors(['end_date']);
});

// ──────────────────────────────────────────────────────────────────────────────
// Test 6 — application_deadline equals start_date is allowed
// ──────────────────────────────────────────────────────────────────────────────

it('allows application_deadline equal to start_date', function () {
    $ngo     = makeNgoActor();
    $payload = validPayload($ngo);
    $date    = now()->addDays(10)->toDateString();
    $payload['start_date']           = $date;
    $payload['application_deadline'] = $date;

    $response = $this->postJson('/api/ngo/tasks', $payload);

    $response->assertStatus(201);
});

// ──────────────────────────────────────────────────────────────────────────────
// Test 7 — NGO cannot override selection_logic via create payload
// ──────────────────────────────────────────────────────────────────────────────

it('ignores selection_logic submitted by the NGO and stores recommendation', function () {
    $ngo     = makeNgoActor();
    $payload = validPayload($ngo);
    $payload['selection_logic'] = 'FCFS'; // attempted override

    $response = $this->postJson('/api/ngo/tasks', $payload);

    $response->assertStatus(201)
             ->assertJsonPath('data.selection_logic', 'recommendation');
});

// ──────────────────────────────────────────────────────────────────────────────
// Test 8 — NGO cannot change selection_logic via update
// ──────────────────────────────────────────────────────────────────────────────

it('does not update selection_logic when NGO sends it on task update', function () {
    $ngo     = makeNgoActor();
    $task    = Task::factory()->create([
        'ngo_id'          => $ngo->id,
        'selection_logic' => 'recommendation',
        'created_by'      => $ngo->user_id,
    ]);

    $response = $this->putJson("/api/ngo/tasks/{$task->id}", [
        'selection_logic' => 'FCFS',
        'urgency_level'   => 'High',
    ]);

    // The update itself should succeed...
    $response->assertStatus(200);

    // ...but selection_logic must remain unchanged.
    $this->assertDatabaseHas('tasks', [
        'id'              => $task->id,
        'selection_logic' => 'recommendation',
        'urgency_level'   => 'High',
    ]);
});

// ──────────────────────────────────────────────────────────────────────────────
// Test 9 — today's date is accepted for start_date (boundary)
// ──────────────────────────────────────────────────────────────────────────────

it('accepts today as start_date', function () {
    $ngo     = makeNgoActor();
    $payload = validPayload($ngo);
    $payload['start_date']           = now()->toDateString();
    $payload['application_deadline'] = now()->toDateString();
    $payload['end_date']             = now()->addDays(5)->toDateString();

    $response = $this->postJson('/api/ngo/tasks', $payload);

    $response->assertStatus(201);
});

// ──────────────────────────────────────────────────────────────────────────────
// Test 10 — Existing tasks in DB are unaffected (no migration change)
// ──────────────────────────────────────────────────────────────────────────────

it('existing tasks retain their original selection_logic value', function () {
    $ngo = makeNgoActor();

    // Directly insert a legacy task bypassing controller validation.
    $task = Task::factory()->create([
        'ngo_id'          => $ngo->id,
        'selection_logic' => 'FCFS',
        'created_by'      => $ngo->user_id,
    ]);

    // Re-fetch and assert the value is unchanged.
    $this->assertDatabaseHas('tasks', [
        'id'              => $task->id,
        'selection_logic' => 'FCFS',
    ]);
});
