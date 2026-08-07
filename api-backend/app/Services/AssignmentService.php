<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Application;
use App\Models\Task;
use App\Models\VolunteerProfile;
use App\Services\ScheduleConflict\ScheduleConflictService;
use Illuminate\Database\Eloquent\Collection;

class AssignmentService
{
    public function __construct(
        private RecommendationService $recommendationService,
        private MinCostMaxFlowService $minCostMaxFlow,
        private ScheduleConflictService $scheduleConflictService,
    ) {}

    /**
     * Compute an optimised (MCMF) recommendation list for the given
     * applications and tasks.
     *
     * This method NEVER creates assignments and NEVER changes application
     * statuses. It only returns the optimised volunteer→task recommendation
     * list (capacity-aware, global optimum via Minimum-Cost Maximum-Flow over
     * the WSM suitability scores). The NGO remains the final decision-maker.
     *
     * @param int[] $applicationIds
     * @param int[] $taskIds
     * @return array<int, array{application_id: int, volunteer_id: int, volunteer_name: ?string, task_id: int, task_title: string, match_score: float, status: string, assigned_at: null}>
     */
    public function batchAssign(array $applicationIds, array $taskIds): array
    {
        $applications = Application::whereIn('id', $applicationIds)
            ->with(['volunteer.user'])
            ->get();

        $tasks = Task::whereIn('id', $taskIds)
            ->whereNotNull('tfidf_vector')
            ->get();

        $volunteers = $applications
            ->map(fn (Application $application) => $application->volunteer)
            ->filter()
            ->values();

        if ($volunteers->isEmpty() || $tasks->isEmpty()) {
            return [];
        }

        // WSM suitability matrix [volunteerId][taskId] => score (0-100).
        $scores = [];
        foreach ($volunteers as $volunteer) {
            foreach ($tasks as $task) {
                $score = $this->recommendationService
                    ->computeVolunteerTaskMatchScore($volunteer, $task);

                if (config('schedule-conflict.check_on_assign')) {
                    $conflicts = $this->scheduleConflictService->checkTask($volunteer->id, $task->id);
                    if ($conflicts['has_conflicts']) {
                        $score = max(0, $score - 30);
                    }
                }

                $scores[$volunteer->id][$task->id] = $score;
            }
        }

        $optimized = $this->minCostMaxFlow->optimize(
            $volunteers->all(),
            $tasks->all(),
            $scores,
            []
        );

        return $this->flattenRecommendations($optimized['assignments'], $applications, $tasks);
    }

    /**
     * Flatten the MCMF per-task groups into the legacy flat recommendation
     * list, keeping only pairs backed by one of the input applications.
     *
     * @param array<int, array{task_id: int, task_title: string, volunteers: array<int, array{volunteer_id: int, wsm_score: float}>}> $groups
     * @param Collection<int, Application> $applications
     * @param Collection<int, Task> $tasks
     * @return array<int, array{application_id: int, volunteer_id: int, volunteer_name: ?string, task_id: int, task_title: string, match_score: float, status: string, assigned_at: null}>
     */
    private function flattenRecommendations(array $groups, Collection $applications, Collection $tasks): array
    {
        $result = [];

        foreach ($groups as $group) {
            foreach ($group['volunteers'] as $pair) {
                $volunteerId = $pair['volunteer_id'];
                $taskId = $group['task_id'];

                $application = $applications->first(
                    fn (Application $app) => $app->volunteer_profile_id === $volunteerId
                        && $app->task_id === $taskId
                );

                if (!$application) {
                    continue;
                }

                $task = $tasks->firstWhere('id', $taskId);

                $result[] = [
                    'application_id'   => $application->id,
                    'volunteer_id'     => $volunteerId,
                    'volunteer_name'   => $application->volunteer->user->name ?? null,
                    'task_id'          => $taskId,
                    'task_title'       => $task->title ?? $group['task_title'],
                    'match_score'      => round(($pair['wsm_score'] ?? 0) / 100, 3),
                    'status'           => 'recommended',
                    'assigned_at'      => null,
                ];
            }
        }

        return $result;
    }
}
