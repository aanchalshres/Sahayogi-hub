<?php

namespace App\Http\Controllers\Ngo;

use App\Events\TrustScore\TaskCompleted;
use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $ngo = $request->user()->ngoProfile;

        return response()->json([
            'data' => Task::where('ngo_id', $ngo->id)
                ->with(['skills', 'category'])
                ->withCount(['applications as total_applications', 'applications as pending_applications' => function ($q) {
                    $q->where('status', 'Pending');
                }, 'applications as accepted_applications' => function ($q) {
                    $q->where('status', 'Accepted');
                }])
                ->orderBy('created_at', 'desc')
                ->get()
        ]);
    }

    public function show(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $task = Task::where('ngo_id', $ngo->id)
            ->with(['skills', 'category', 'ngo'])
            ->withCount(['applications as total_applications', 'applications as pending_applications' => function ($q) {
                $q->where('status', 'Pending');
            }, 'applications as accepted_applications' => function ($q) {
                $q->where('status', 'Accepted');
            }])
            ->findOrFail($id);

        return response()->json([
            'data' => $task
        ]);
    }

    public function store(Request $request)
    {
        $ngo = $request->user()->ngoProfile;

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',

            'category_id' => 'required|exists:categories,id',
            'task_type' => 'required|string',

            'location' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',

            'required_volunteers' => 'required|integer|min:1',

            // Date rules: tasks must not be created with past dates.
            'start_date' => 'nullable|date|after_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'application_deadline' => [
                'nullable',
                'date',
                'after_or_equal:today',
                // Deadline must not exceed start_date when start_date is provided.
                $request->filled('start_date') ? 'before_or_equal:start_date' : '',
            ],

            'urgency_level' => 'sometimes|string',
            'status' => 'sometimes|string',

            'skill_ids' => 'sometimes|array',
            'skill_ids.*' => 'exists:skills,id',
            'skills' => 'sometimes|array',
            'skills.*' => 'exists:skills,id',
        ]);

        // selection_logic is controlled by the system, not the NGO.
        // Always use 'recommendation' on task creation.
        $validated['selection_logic'] = 'recommendation';

        $validated['ngo_id'] = $ngo->id;
        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(4);
        $validated['created_by'] = $request->user()->id;

        $validated = $this->normalizeTaskFields($validated);

        $task = Task::create($validated);

        $skillIds = $validated['skill_ids'] ?? $validated['skills'] ?? [];
        if (!empty($skillIds)) {
            $task->skills()->sync($skillIds);
        }

        $task->load(['skills', 'category']);
        $task->touch();

        return response()->json([
            'message' => 'Task created',
            'data' => $task
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $task = Task::where('ngo_id', $ngo->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',

            'category_id' => 'sometimes|exists:categories,id',
            'task_type' => 'sometimes|string',
            // selection_logic is NOT accepted from NGO users on update.

            'location' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',

            'required_volunteers' => 'sometimes|integer|min:1',

            // Date rules applied on update as well.
            'start_date' => 'nullable|date|after_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'application_deadline' => [
                'nullable',
                'date',
                'after_or_equal:today',
                $request->filled('start_date') ? 'before_or_equal:start_date' : '',
            ],

            'urgency_level' => 'sometimes|string',
            'status' => 'sometimes|string',

            'skill_ids' => 'sometimes|array',
            'skill_ids.*' => 'exists:skills,id',
            'skills' => 'sometimes|array',
            'skills.*' => 'exists:skills,id',
        ]);

        $validated = $this->normalizeTaskFields($validated);
        $validated['updated_by'] = $request->user()->id;

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . $task->id;
        }

        $task->update($validated);

        $skillIds = $validated['skill_ids'] ?? $validated['skills'] ?? null;
        if ($skillIds !== null) {
            $task->skills()->sync($skillIds);
        }

        $task->load(['skills', 'category']);
        $task->touch();

        return response()->json([
            'message' => 'Task updated',
            'data' => $task
        ]);
    }

    public function complete(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $task = Task::where('ngo_id', $ngo->id)
            ->findOrFail($id);

        if ($task->status === 'Completed') {
            return response()->json([
                'message' => 'Task is already completed'
            ], 422);
        }

        $task->update([
            'status' => 'Completed',
            'updated_by' => $request->user()->id,
        ]);

        $acceptedVolunteers = Application::where('task_id', $task->id)
            ->where('status', 'Accepted')
            ->get();
        foreach ($acceptedVolunteers as $app) {
            TaskCompleted::dispatch($app->volunteer_profile_id, $task->id);
        }

        return response()->json([
            'message' => 'Task completed',
            'data' => $task
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $task = Task::where('ngo_id', $ngo->id)
            ->findOrFail($id);

        $task->delete();

        return response()->json([
            'message' => 'Task deleted'
        ]);
    }

    private function normalizeTaskFields(array $data): array
    {
        $statusMap = [
            'draft' => 'Draft', 'open' => 'Open', 'ongoing' => 'Ongoing',
            'completed' => 'Completed', 'cancelled' => 'Cancelled',
        ];
        $urgencyMap = [
            'low' => 'Low', 'medium' => 'Medium', 'high' => 'High',
        ];
        $taskTypeMap = [
            'one_time' => 'Event', 'ongoing' => 'Ongoing', 'flexible' => 'Task',
            'event' => 'Event', 'emergency' => 'Emergency', 'campaign' => 'Campaign', 'task' => 'Task',
        ];

        if (isset($data['status']) && isset($statusMap[strtolower($data['status'])])) {
            $data['status'] = $statusMap[strtolower($data['status'])];
        }
        if (!isset($data['status'])) {
            $data['status'] = 'Open';
        }

        if (isset($data['urgency_level']) && isset($urgencyMap[strtolower($data['urgency_level'])])) {
            $data['urgency_level'] = $urgencyMap[strtolower($data['urgency_level'])];
        }

        if (isset($data['task_type']) && isset($taskTypeMap[strtolower($data['task_type'])])) {
            $data['task_type'] = $taskTypeMap[strtolower($data['task_type'])];
        }

        return $data;
    }
}
