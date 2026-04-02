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

    /**
     * Get all NGOs with related user data
     */
    public function ngos()
    {
        $ngos = NgoProfile::with('user')
            ->latest()
            ->get()
            ->map(function ($ngo) {
                return [
                    'id' => $ngo->id,
                    'organization_name' => $ngo->organization_name,
                    'registration_number' => $ngo->registration_number,
                    'pan_number' => $ngo->pan_number,
                    'office_location' => $ngo->office_location,
                    'is_verified' => $ngo->is_verified,
                    'status' => $ngo->status ?? 'pending',
                    'created_at' => $ngo->created_at,
                    'user' => [
                        'id' => $ngo->user?->id,
                        'name' => $ngo->user?->name,
                        'email' => $ngo->user?->email,
                        'phone' => $ngo->user?->phone,
                    ],
                ];
            });

        return response()->json($ngos);
    }

    /**
     * Get NGO details by ID
     */
    public function ngoDetails($id)
    {
        $ngo = NgoProfile::with('user')->findOrFail($id);

        // Generate full URLs for document files using storage symlink
        $registrationUrl = null;
        $panUrl = null;
        $letterheadUrl = null;

        // Build URLs: {APP_URL}/storage/{path}
        if ($ngo->registration_file_path) {
            $registrationUrl = url('storage/' . $ngo->registration_file_path);
        }
        if ($ngo->pan_file_path) {
            $panUrl = url('storage/' . $ngo->pan_file_path);
        }
        if ($ngo->letterhead_file_path) {
            $letterheadUrl = url('storage/' . $ngo->letterhead_file_path);
        }

        return response()->json([
            'id' => $ngo->id,
            'organization_name' => $ngo->organization_name,
            'registration_number' => $ngo->registration_number,
            'pan_number' => $ngo->pan_number,
            'office_location' => $ngo->office_location,
            'is_verified' => $ngo->is_verified,
            'status' => $ngo->status ?? 'pending',
            'created_at' => $ngo->created_at,
            'registration_file_path' => $registrationUrl,
            'pan_file_path' => $panUrl,
            'letterhead_file_path' => $letterheadUrl,
            'user' => [
                'id' => $ngo->user?->id,
                'name' => $ngo->user?->name,
                'email' => $ngo->user?->email,
                'phone' => $ngo->user?->phone,
            ],
        ]);
    }
}
