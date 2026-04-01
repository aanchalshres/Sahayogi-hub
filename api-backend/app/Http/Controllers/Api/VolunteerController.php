<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VolunteerController extends Controller
{
    /**
     * Get all available tasks (only active tasks from verified NGOs)
     */
    public function getTasks(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this',
            ], 403);
        }

        // Get active tasks from verified NGOs only
        $tasks = Task::where('status', 'active')
            ->where('filled_quota', '<', DB::raw('quota'))
            ->whereHas('user.ngoProfile', function ($query) {
                $query->where('is_verified', true);
            })
            ->with(['user', 'skills'])
            ->get();

        return response()->json(['data' => $tasks]);
    }

    /**
     * Get task details
     */
    public function getTaskDetail(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this',
            ], 403);
        }

        $task = Task::findOrFail($id);

        // Check if task is from a verified NGO
        if (!$task->user->ngoProfile || !$task->user->ngoProfile->is_verified) {
            return response()->json([
                'message' => 'Task not available',
            ], 404);
        }

        return response()->json(['data' => $task->load(['user', 'applications', 'skills'])]);
    }

    /**
     * Apply for a task
     */
    public function applyForTask(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can apply for tasks',
            ], 403);
        }

        $task = Task::findOrFail($id);

        // Verify task is from verified NGO
        if (!$task->user->ngoProfile || !$task->user->ngoProfile->is_verified) {
            return response()->json([
                'message' => 'Cannot apply to this task',
            ], 403);
        }

        // Check if volunteer has already applied
        $existingApplication = Application::where('task_id', $id)
            ->where('volunteer_id', $user->id)
            ->first();

        if ($existingApplication) {
            return response()->json([
                'message' => 'You have already applied for this task',
            ], 409);
        }

        // Check quota
        if ($task->filled_quota >= $task->quota) {
            return response()->json([
                'message' => 'Task quota is full',
            ], 400);
        }

        // Create application
        $application = Application::create([
            'task_id' => $id,
            'volunteer_id' => $user->id,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Application submitted successfully',
            'data' => $application,
        ], 201);
    }

    /**
     * Get volunteer's applications
     */
    public function getApplications(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this',
            ], 403);
        }

        $applications = Application::where('volunteer_id', $user->id)
            ->with(['task', 'task.user'])
            ->get();

        return response()->json(['data' => $applications]);
    }

    /**
     * Get volunteer's profile
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this',
            ], 403);
        }

        return response()->json([
            'data' => $user->load('volunteerProfile'),
        ]);
    }
}
