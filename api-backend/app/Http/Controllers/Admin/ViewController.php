<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NgoProfile;
use App\Models\Task;
use App\Models\User;

class GodViewController extends Controller
{
    // Approve NGO
    public function approveNgo($id)
    {
        $ngo = NgoProfile::findOrFail($id);
        $ngo->is_verified = true;
        $ngo->save();
        return response()->json(['message' => 'NGO approved successfully']);
    }

    // Delete Task
    public function deleteTask($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }

    // System Stats
    public function stats()
    {
        $totalUsers = User::count();
        $activeTasks = Task::where('status', 'active')->count();
        $totalNgos = NgoProfile::count();
        return response()->json([
            'total_users' => $totalUsers,
            'active_tasks' => $activeTasks,
            'total_ngos' => $totalNgos,
        ]);
    }
}
