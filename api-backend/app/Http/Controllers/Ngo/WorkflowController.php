<?php

namespace App\Http\Controllers\Ngo;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Services\WorkflowService;
use Illuminate\Http\Request;

class WorkflowController extends Controller
{
    public function __construct(
        private WorkflowService $workflowService
    ) {}

    public function prioritizedApplications(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $task = Task::where('ngo_id', $ngo->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'strategy' => 'nullable|string',
        ]);

        $strategy = $validated['strategy'] ?? null;

        $applications = $this->workflowService->getPrioritizedApplications($task, $strategy);

        return response()->json([
            'strategy_used' => $strategy ?? config('workflow.default_strategy', 'recommendation'),
            'data' => $applications->map(function ($app) {
                return [
                    'id'                     => $app->id,
                    'task_id'                => $app->task_id,
                    'volunteer_profile_id'   => $app->volunteer_profile_id,
                    'volunteer_name'         => $app->volunteer->user->name ?? 'Unknown',
                    'volunteer_email'        => $app->volunteer->user->email ?? '',
                    'status'                 => $app->status,
                    'applied_at'             => $app->applied_at,
                    'remarks'                => $app->remarks,
                    'priority_score'         => $app->priority_score,
                    'recommendation_score'   => $app->recommendation_score,
                    'semantic_match_score'   => $app->semantic_match_score ?? 0,
                    'distance_score'         => $app->distance_score ?? 0,
                    'skill_overlap_score'    => $app->skill_overlap_score ?? 0,
                    'availability_score'     => $app->availability_score ?? 0,
                    'trust_score'            => $app->trust_score ?? 0.5,
                    // ── Rich metadata from algorithm ─────────────────────
                    'matched_skills'         => $app->matched_skills ?? [],
                    'missing_skills'         => $app->missing_skills ?? [],
                    'distance_km'            => $app->distance_km ?? null,
                    'recommendation_reason'  => $app->recommendation_reason ?? '',
                ];
            }),
        ]);
    }
}