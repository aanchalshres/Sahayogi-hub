<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Application;
use Illuminate\Http\Request;

class NgoController extends Controller
{
    /**
     * Create a task (only verified NGOs via middleware)
     */
    public function createTask(Request $request)
    {
        $user = $request->user();

        // Validate input
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'district' => 'required|string',
            'quota' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'skills' => 'nullable|array',
        ]);

        // Create task
        $task = Task::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'],
            'district' => $validated['district'],
            'quota' => $validated['quota'],
            'filled_quota' => 0,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => 'active',
        ]);

        if (!empty($validated['skills'])) {
            $task->skills()->attach($validated['skills']);
        }

        return response()->json([
            'message' => 'Task created successfully',
            'data' => $task,
        ], 201);
    }

    /**
     * Get NGO's tasks
     */
    public function getTasks(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'ngo') {
            return response()->json([
                'message' => 'Only NGOs can access this',
            ], 403);
        }

        $tasks = Task::where('user_id', $user->id)
            ->with(['applications', 'skills'])
            ->get();

        return response()->json(['data' => $tasks]);
    }

    /**
     * Get applications for NGO's tasks
     */
    public function getApplications(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'ngo') {
            return response()->json([
                'message' => 'Only NGOs can access this',
            ], 403);
        }

        $applications = Application::whereHas('task', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->with(['volunteer', 'task'])->get();

        return response()->json(['data' => $applications]);
    }

    /**
     * Accept an application
     */
    public function acceptApplication(Request $request, $id)
    {
        $user = $request->user();
        $application = Application::findOrFail($id);

        // Verify ownership
        if ($application->task->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $application->update(['status' => 'accepted']);

        return response()->json([
            'message' => 'Application accepted',
            'data' => $application,
        ]);
    }

    /**
     * Reject an application
     */
    public function rejectApplication(Request $request, $id)
    {
        $user = $request->user();
        $application = Application::findOrFail($id);

        // Verify ownership
        if ($application->task->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $application->update(['status' => 'rejected']);

        return response()->json([
            'message' => 'Application rejected',
            'data' => $application,
        ]);
    }

    /**
     * Mark task as completed
     */
    public function completeTask(Request $request, $id)
    {
        $user = $request->user();
        $task = Task::findOrFail($id);

        // Verify ownership
        if ($task->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $task->update(['status' => 'completed']);

        return response()->json([
            'message' => 'Task marked as completed',
            'data' => $task,
        ]);
    }
}
