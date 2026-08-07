<?php

namespace App\Services;

use App\Models\Application;
use App\Models\NgoProfile;
use App\Models\Shortlist;
use App\Models\Task;
use App\Models\VolunteerProfile;
use Illuminate\Database\Eloquent\Collection;

class WorkflowService
{
    public function __construct(
        private RecommendationService $recommendation,
        private MinCostMaxFlowService $minCostMaxFlow
    ) {}

    public function generateShortlist(Task $task, ?int $limit = null, ?string $strategy = null): Collection
    {
        $limit = $limit ?? config('workflow.shortlist_limit', 10);
        $strategy = $strategy ?? config('workflow.default_strategy', 'recommendation');

        $volunteers = $this->recommendation->rankVolunteersForTask($task);

        $shortlisted = $volunteers->take($limit);

        $upsertData = [];
        $shortlistRanks = [];
        $strategyScores = [];
        $shortlistData = [];
        $rank = 1;
        $now = now();

        foreach ($shortlisted as $volunteer) {
            $currentRank = $rank++;

            // WSM is the single scoring stage — its output (recommendation_score)
            // is the strategy score for the shortlist.
            $strategyScore = ($volunteer->recommendation_score ?? 0) / 100;

            $upsertData[] = [
                'task_id' => $task->id,
                'volunteer_profile_id' => $volunteer->id,
                'recommendation_score' => $volunteer->recommendation_score,
                'semantic_match_score' => $volunteer->semantic_match_score ?? 0,
                'distance_score' => $volunteer->distance_score ?? 0,
                'skill_overlap_score' => $volunteer->skill_overlap_score ?? 0,
                'availability_score' => $volunteer->availability_score ?? 0,
                'trust_score' => $volunteer->trust_score ?? 0.5,
                'strategy_used' => $strategy,
                'rank' => $currentRank,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            $shortlistRanks[$volunteer->id] = $currentRank;
            $strategyScores[$volunteer->id] = $strategyScore;
            $shortlistData[] = $volunteer;
        }

        Shortlist::upsert($upsertData, ['task_id', 'volunteer_profile_id']);

        Shortlist::where('task_id', $task->id)
            ->whereNotIn('volunteer_profile_id', $shortlisted->pluck('id'))
            ->delete();

        $result = new Collection($shortlistData);
        $result->each(function ($v) use ($strategy, $shortlistRanks, $strategyScores) {
            $v->strategy_score = round(($strategyScores[$v->id] ?? 0) * 100, 1);
            $v->strategy_used = $strategy;
            $v->shortlist_rank = $shortlistRanks[$v->id] ?? null;
        });

        return $result->sortBy('shortlist_rank')->values();
    }

    /**
     * Final optimisation stage: run Minimum-Cost Maximum-Flow over the NGO's
     * active tasks and the eligible volunteer pool.
     *
     * This is the capacity-aware, global counterpart of generateShortlist().
     * WSM suitability scores are converted to edge costs (cost = 100 − score)
     * inside MinCostMaxFlowService. The result is a per-task recommendation
     * list that respects `required_volunteers` capacity and recommends each
     * volunteer to at most one task.
     *
     * This method NEVER creates assignments — it only computes the optimised
     * recommendation list. The NGO remains the final decision-maker and can
     * approve or reject the recommended volunteers.
     *
     * @param NgoProfile $ngo     the authenticated NGO
     * @param array      $options MCMF options forwarded to the solver
     *
     * @return array the raw MCMF result (total_flow, total_cost,
     *               total_wsm_score, assignments, unassigned_volunteers)
     */
    public function generateOptimizedRecommendations(NgoProfile $ngo, array $options = []): array
    {
        // Active tasks of this NGO that have a TF-IDF profile to match on.
        $tasks = Task::where('ngo_id', $ngo->id)
            ->whereIn('status', ['Open', 'Ongoing'])
            ->whereNotNull('tfidf_vector')
            ->where('tfidf_vector', '!=', '[]')
            ->with(['skills'])
            ->get();

        if ($tasks->isEmpty()) {
            return [
                'total_flow' => 0,
                'total_cost' => 0.0,
                'total_wsm_score' => 0.0,
                'assignments' => [],
                'unassigned_volunteers' => [],
            ];
        }

        $taskIds = $tasks->pluck('id')->all();

        // Candidate pool: active volunteers with a TF-IDF profile who have not
        // already applied to (or been accepted for) any of these tasks.
        $volunteers = VolunteerProfile::with(['user', 'skills'])
            ->whereHas('user', function ($q) {
                $q->where('is_active', true);
            })
            ->whereNotNull('tfidf_vector')
            ->where('tfidf_vector', '!=', '[]')
            ->whereDoesntHave('applications', function ($q) use ($taskIds) {
                $q->whereIn('task_id', $taskIds)
                  ->whereIn('status', ['Pending', 'Shortlisted', 'Accepted']);
            })
            ->get();

        if ($volunteers->isEmpty()) {
            return [
                'total_flow' => 0,
                'total_cost' => 0.0,
                'total_wsm_score' => 0.0,
                'assignments' => [],
                'unassigned_volunteers' => [],
            ];
        }

        // Build the WSM suitability matrix [volunteerId][taskId] => score.
        $scores = [];
        foreach ($volunteers as $volunteer) {
            foreach ($tasks as $task) {
                $scores[$volunteer->id][$task->id] =
                    $this->recommendation->computeVolunteerTaskMatchScore($volunteer, $task);
            }
        }

        return $this->minCostMaxFlow->optimize(
            $volunteers->all(),
            $tasks->all(),
            $scores,
            $options
        );
    }

    public function getShortlist(Task $task): Collection
    {
        $shortlistEntries = Shortlist::where('task_id', $task->id)
            ->with('volunteer.user', 'volunteer.skills')
            ->orderBy('rank')
            ->get();

        $volunteers = $shortlistEntries->map(function ($entry) {
            $v = $entry->volunteer;
            if (!$v) {
                return null;
            }
            $v->shortlist_rank = $entry->rank;
            $v->recommendation_score = $entry->recommendation_score;
            $v->semantic_match_score = $entry->semantic_match_score;
            $v->distance_score = $entry->distance_score;
            $v->skill_overlap_score = $entry->skill_overlap_score;
            $v->availability_score = $entry->availability_score;
            $v->trust_score = $entry->trust_score;
            $v->strategy_used = $entry->strategy_used;
            return $v;
        })->filter()->values();

        return $volunteers;
    }

    public function getPrioritizedApplications(Task $task, ?string $strategy = null): \Illuminate\Support\Collection
    {
        $strategy = $strategy ?? config('workflow.default_strategy', 'recommendation');

        $applications = Application::where('task_id', $task->id)
            ->with(['volunteer.user', 'volunteer.skills'])
            ->get();

        $applications->each(function ($application) use ($strategy) {
            $profile = $application->volunteer;
            if (!$profile) {
                $application->priority_score = 0;
                return;
            }

            $detailed = $this->recommendation->computeDetailedScores($profile, $application->task);
            $application->recommendation_score = $detailed['recommendation_score'];
            $application->semantic_match_score = $detailed['semantic_match_score'];
            $application->distance_score = $detailed['distance_score'];
            $application->skill_overlap_score = $detailed['skill_overlap_score'];
            $application->availability_score = $detailed['availability_score'];
            $application->trust_score = $detailed['trust_score'];
            $application->matched_skills = $detailed['matched_skills'];
            $application->missing_skills = $detailed['missing_skills'];
            $application->distance_km = $detailed['distance_km'];
            $application->recommendation_reason = $detailed['recommendation_reason'];
            // WSM output is the priority score for the single strategy.
            $application->priority_score = $detailed['recommendation_score'];
            $application->strategy_used = 'recommendation';
        });

        return $applications->sortByDesc('priority_score')->values();
    }

    public function getRecommendedNgos(VolunteerProfile $volunteer, ?int $limit = null, ?string $strategy = null): \Illuminate\Support\Collection
    {
        $limit = $limit ?? config('workflow.ngo_recommendation_limit', 10);
        $strategy = $strategy ?? config('workflow.default_strategy', 'recommendation');

        $volunteer->loadMissing('user', 'skills');

        $tasks = Task::whereIn('status', ['Open', 'Ongoing'])
            ->whereHas('ngo', function ($q) {
                $q->where('verification_status', 'verified');
            })
            ->whereNotNull('tfidf_vector')
            ->where('tfidf_vector', '!=', '[]')
            ->with(['ngo.user', 'skills'])
            ->get();

        $ngoMap = [];

        foreach ($tasks as $task) {
            if (!$task->ngo) {
                continue;
            }

            $scores = $this->recommendation->computeAllScores($volunteer, $task);

            // The single strategy (WSM) score is recommendation_score (0-100).
            $strategyScore = ($scores['recommendation_score'] ?? 0) / 100;

            $ngoId = $task->ngo->id;

            if (!isset($ngoMap[$ngoId])) {
                $ngoMap[$ngoId] = [
                    'ngo' => $task->ngo,
                    'total_score' => 0,
                    'count' => 0,
                    'best_task' => $task,
                    'best_score' => $strategyScore,
                    'best_scores' => $scores,
                ];
            }

            $ngoMap[$ngoId]['total_score'] += $strategyScore;
            $ngoMap[$ngoId]['count']++;
            $ngoMap[$ngoId]['best_score'] = max($ngoMap[$ngoId]['best_score'], $strategyScore);
            if ($strategyScore >= $ngoMap[$ngoId]['best_score']) {
                $ngoMap[$ngoId]['best_task'] = $task;
                $ngoMap[$ngoId]['best_scores'] = $scores;
            }
        }

        $ngoScores = collect($ngoMap)->map(function ($data) {
            $ngo = $data['ngo'];
            $avgScore = $data['total_score'] / max($data['count'], 1);
            $ngo->recommendation_score = round($avgScore * 100, 1);
            $ngo->best_task_score = round($data['best_score'] * 100, 1);
            $ngo->matching_opportunities_count = $data['count'];
            $ngo->best_task_title = $data['best_task']->title;
            $ngo->best_task_id = $data['best_task']->id;
            $ngo->semantic_match_score = $data['best_scores']['semantic_match_score'] ?? 0;
            $ngo->distance_score = $data['best_scores']['distance_score'] ?? 0;
            $ngo->skill_overlap_score = $data['best_scores']['skill_overlap_score'] ?? 0;
            $ngo->availability_score = $data['best_scores']['availability_score'] ?? 0;
            $ngo->trust_score = $data['best_scores']['trust_score'] ?? 0.5;
            return $ngo;
        })->sortByDesc('recommendation_score')->values();

        return $ngoScores->take($limit);
    }
}
