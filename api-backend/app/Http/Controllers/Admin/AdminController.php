<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NgoProfile;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get all NGOs pending verification
     */
    public function getNgoVerification()
    {
        $ngos = NgoProfile::where('is_verified', false)
            ->with('user')
            ->get();

        return response()->json([
            'data' => $ngos,
            'total' => $ngos->count(),
        ]);
    }

    /**
     * Verify an NGO
     */
    public function verifyNgo($id)
    {
        $ngoProfile = NgoProfile::findOrFail($id);
        $ngoProfile->update(['is_verified' => true]);

        return response()->json([
            'message' => 'NGO verified successfully',
            'data' => $ngoProfile,
        ]);
    }

    /**
     * Reject an NGO (set to unverified)
     */
    public function rejectNgo($id)
    {
        $ngoProfile = NgoProfile::findOrFail($id);
        $ngoProfile->update(['is_verified' => false]);

        return response()->json([
            'message' => 'NGO rejected',
            'data' => $ngoProfile,
        ]);
    }

    /**
     * Get all tasks for moderation
     */
    public function getTaskModeration()
    {
        $tasks = Task::with(['ngo', 'applications'])
            ->get();

        return response()->json([
            'data' => $tasks,
            'total' => $tasks->count(),
        ]);
    }

    /**
     * Delete a task (inappropriate content)
     */
    public function deleteTask($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully',
        ]);
    }

    /**
     * Get system statistics
     */
    public function getSystemStats()
    {
        $stats = [
            'total_users' => DB::table('users')->count(),
            'total_volunteers' => DB::table('users')->where('role', 'volunteer')->count(),
            'total_ngos' => DB::table('users')->where('role', 'ngo')->count(),
            'verified_ngos' => DB::table('ngo_profiles')->where('is_verified', true)->count(),
            'pending_ngos' => DB::table('ngo_profiles')->where('is_verified', false)->count(),
            'total_tasks' => DB::table('tasks')->count(),
            'active_tasks' => DB::table('tasks')->where('status', 'active')->count(),
            'total_applications' => DB::table('applications')->count(),
        ];

        return response()->json(['data' => $stats]);
    }
}
