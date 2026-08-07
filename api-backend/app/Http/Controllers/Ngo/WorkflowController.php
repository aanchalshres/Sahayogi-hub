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

    public function shortlist(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $task = Task::where('ngo_id', $ngo->id)
            ->findOrFail($id);

        $shortlist = $this->workflowService->getShortlist($task);

        return response()->json([
            'data' => $shortlist->map(function ($v) {
                return [
                    'id' => $v->id,
                    'user_id' => $v->user_id,
                    'name' => $v->user->name ?? 'Unknown',
                    'email' => $v->user->email ?? '',
                    'phone' => $v->user->phone ?? '',
                    'bio' => $v->bio ?? '',
                    'city' => $v->city ?? '',
                    'country' => $v->country ?? '',
                    'skills' => $v->skills->map(fn ($s) => [
                        'id' => $s->id,
                        'name' => $s->name,
                        'proficiency_level' => $s->pivot->proficiency_level ?? null,
                    ]),
                    'shortlist_rank' => $v->shortlist_rank,
                    'recommendation_score' => $v->recommendation_score,
                    'semantic_match_score' => $v->semantic_match_score ?? 0,
                    'skill_overlap_score' => $v->skill_overlap_score ?? 0,
                    'distance_score' => $v->distance_score ?? 0,
                    'availability_score' => $v->availability_score ?? 0,
                    'trust_score' => $v->trust_score ?? 0,
                    'strategy_used' => $v->strategy_used ?? 'recommendation',
                ];
            }),
        ]);
    }

    public function generateShortlist(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $task = Task::where('ngo_id', $ngo->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'limit' => 'nullable|integer|min:1|max:50',
            'strategy' => 'nullable|string',
        ]);

        $limit = $validated['limit'] ?? null;
        $strategy = $validated['strategy'] ?? null;

        $shortlist = $this->workflowService->generateShortlist($task, $limit, $strategy);

        return response()->json([
            'message' => 'Shortlist generated',
            'strategy_used' => $strategy ?? config('workflow.default_strategy', 'recommendation'),
            'data' => $shortlist->map(function ($v) {
                return [
                    'id' => $v->id,
                    'user_id' => $v->user_id,
                    'name' => $v->user->name ?? 'Unknown',
                    'email' => $v->user->email ?? '',
                    'phone' => $v->user->phone ?? '',
                    'bio' => $v->bio ?? '',
                    'city' => $v->city ?? '',
                    'country' => $v->country ?? '',
                    'skills' => $v->skills->map(fn ($s) => [
                        'id' => $s->id,
                        'name' => $s->name,
                        'proficiency_level' => $s->pivot->proficiency_level ?? null,
                    ]),
                    'shortlist_rank' => $v->shortlist_rank,
                    'recommendation_score' => $v->recommendation_score,
                    'semantic_match_score' => $v->semantic_match_score ?? 0,
                    'skill_overlap_score' => $v->skill_overlap_score ?? 0,
                    'distance_score' => $v->distance_score ?? 0,
                    'availability_score' => $v->availability_score ?? 0,
                    'trust_score' => $v->trust_score ?? 0,
                    'strategy_score' => $v->strategy_score,
                    'strategy_used' => $v->strategy_used,
                ];
            }),
        ]);
    }

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

    public function strategies()
    {
        return response()->json([
            'data' => [
                [
                    'key' => 'recommendation',
                    'label' => config('workflow.strategies.recommendation.label', 'Recommendation Score'),
                    'weights' => config('workflow.strategies.recommendation.weights', []),
                ],
            ],
        ]);
    }

    /**
     * Final optimisation stage: Minimum-Cost Maximum-Flow recommendations.
     *
     * Runs MCMF across all active tasks of the NGO and the eligible volunteer
     * pool, converting WSM scores into edge costs. Returns a per-task,
     * capacity-aware recommendation list. This does NOT create assignments —
     * the NGO approves or rejects the recommended volunteers.
     */
    public function optimizedRecommendations(Request $request)
    {
        $ngo = $request->user()->ngoProfile;

        $options = [
            'availability_filter' => ['Available'],
        ];

        $optimized = $this->workflowService
            ->generateOptimizedRecommendations($ngo, $options);

        return response()->json([
            'message' => 'Optimized volunteer recommendations generated (MCMF). ' .
                         'No assignments were created — review and approve manually.',
            'total_flow'      => $optimized['total_flow'],
            'total_cost'      => $optimized['total_cost'],
            'total_wsm_score' => $optimized['total_wsm_score'],
            'assignments'     => $optimized['assignments'],
            'unassigned_volunteers' => $optimized['unassigned_volunteers'],
        ]);
    }
}
