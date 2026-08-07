<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Services\RecommendationService;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(
        private RecommendationService $recommendationService
    ) {}

    public function getTasks(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this'
            ], 403);
        }

        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json([
                'message' => 'Volunteer profile not found.'
            ], 404);
        }

        $filters = array_filter($request->only([
            'search', 'category_id', 'urgency_level', 'task_type',
            'location', 'skill', 'date_from', 'date_to',
        ]));

        return response()->json([
            'data' => $this->recommendationService
                ->rankTasksForVolunteer($profile, $filters)
        ]);
    }

    public function getTaskDetail(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this'
            ], 403);
        }

        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json([
                'message' => 'Volunteer profile not found.'
            ], 404);
        }

        $task = $this->recommendationService->getTaskDetail($id);

        $app = Application::where('task_id', $id)
            ->where('volunteer_profile_id', $profile->id)
            ->first();

        $task->application_status = $app ? $app->status : 'Not Applied';

        $acceptedCount = Application::where('task_id', $id)
            ->where('status', 'Accepted')
            ->count();

        $task->filled_slots     = $acceptedCount;
        $task->remaining_slots  = max(0, ($task->required_volunteers ?? 0) - $acceptedCount);

        // ── Attach match analysis (existing algorithm, no formula changes) ──
        $detailed = $this->recommendationService->computeDetailedScores($profile, $task);

        $task->match_analysis = [
            'recommendation_score'  => $detailed['recommendation_score'],
            'semantic_match_score'  => $detailed['semantic_match_score'],
            'skill_overlap_score'   => $detailed['skill_overlap_score'],
            'distance_score'        => $detailed['distance_score'],
            'availability_score'    => $detailed['availability_score'],
            'trust_score'           => $detailed['trust_score'],
            'matched_skills'        => $detailed['matched_skills'],
            'missing_skills'        => $detailed['missing_skills'],
            'distance_km'           => $detailed['distance_km'],
            'recommendation_reason' => $detailed['recommendation_reason'],
        ];

        return response()->json([
            'data' => $task,
        ]);
    }
}
