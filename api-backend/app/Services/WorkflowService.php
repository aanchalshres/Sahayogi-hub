<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Task;
use App\Models\VolunteerProfile;
use Illuminate\Database\Eloquent\Collection;

class WorkflowService
{
    public function __construct(
        private RecommendationService $recommendation,
        private MinCostMaxFlowService $minCostMaxFlow
    ) {}

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