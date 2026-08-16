<?php

namespace App\Http\Controllers\Ngo;

use App\Events\TrustScore\ApplicationStatusChanged;
use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Services\NotificationService;
use App\Services\RecommendationService;
use App\Services\ScheduleConflict\ScheduleConflictService;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function __construct(
        private ScheduleConflictService $scheduleConflictService,
        private RecommendationService $recommendationService
    ) {}

    public function index(Request $request)
    {
        $ngo = $request->user()->ngoProfile;

        $query = Application::whereHas('task', function ($q) use ($ngo) {
            $q->where('ngo_id', $ngo->id);
        })->with([
            'volunteer.user',
            'volunteer.skills',
            'volunteer.documents' => function ($q) {
                $q->where('status', 'verified');
            },
            'task.skills',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('task_id')) {
            $query->where('task_id', $request->task_id);
        }

        $perPage = min((int) $request->input('per_page', 20), 50);
        $sortBy  = $request->input('sort_by', 'recommendation_score');
        $allowedSorts = ['recommendation_score', 'trust_score', 'distance_score', 'skill_overlap_score', 'created_at'];

        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'recommendation_score';
        }

        // If sorting by a computed score, fetch all matching records, compute scores, sort, then paginate collection
        if (in_array($sortBy, ['recommendation_score', 'trust_score', 'distance_score', 'skill_overlap_score'])) {
            $allApplications = $query->get();

            $items = $allApplications->map(function ($app) {
                $volunteer = $app->volunteer;
                $task      = $app->task;

                $scores = [];
                if ($volunteer && $task && $volunteer->tfidf_vector && $volunteer->tfidf_vector !== '[]') {
                    try {
                        $volunteer->loadMissing('skills');
                        $task->loadMissing('skills');
                        $scores = $this->recommendationService->computeDetailedScores($volunteer, $task);
                    } catch (\Throwable $e) {
                        // Silently skip
                    }
                }

                $isVerified = ($volunteer?->documents?->filter(fn ($d) => $d->status === 'verified')->count() ?? 0) > 0;

                return array_merge($app->toArray(), [
                    'is_verified'            => $isVerified,
                    'recommendation_score'   => $scores['recommendation_score'] ?? null,
                    'semantic_match_score'   => $scores['semantic_match_score'] ?? null,
                    'skill_overlap_score'    => $scores['skill_overlap_score'] ?? null,
                    'distance_score'         => $scores['distance_score'] ?? null,
                    'availability_score'     => $scores['availability_score'] ?? null,
                    'trust_score'            => $scores['trust_score'] ?? null,
                    'matched_skills'         => $scores['matched_skills'] ?? [],
                    'missing_skills'         => $scores['missing_skills'] ?? [],
                    'distance_km'            => $scores['distance_km'] ?? null,
                    'recommendation_reason'  => $scores['recommendation_reason'] ?? null,
                ]);
            });

            // Sort globally by the chosen score (nulls last)
            $items = $items->sortByDesc(fn ($item) => $item[$sortBy] ?? -1)->values();

            $total = $items->count();
            $page  = (int) $request->input('page', 1);
            $offset = ($page - 1) * $perPage;

            $paginated = $items->slice($offset, $perPage)->values();

            return response()->json([
                'data' => $paginated,
                'meta' => [
                    'current_page' => $page,
                    'last_page'    => (int) ceil($total / $perPage),
                    'per_page'     => $perPage,
                    'total'        => $total,
                ],
            ]);
        }

        // Default: sort by created_at (database pagination is safe)
        $applications = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $items = collect($applications->items())->map(function ($app) {
            $volunteer = $app->volunteer;
            $task      = $app->task;

            $scores = [];
            if ($volunteer && $task && $volunteer->tfidf_vector && $volunteer->tfidf_vector !== '[]') {
                try {
                    $volunteer->loadMissing('skills');
                    $task->loadMissing('skills');
                    $scores = $this->recommendationService->computeDetailedScores($volunteer, $task);
                } catch (\Throwable $e) {
                    // Silently skip
                }
            }

            $isVerified = ($volunteer?->documents?->filter(fn ($d) => $d->status === 'verified')->count() ?? 0) > 0;

            return array_merge($app->toArray(), [
                'is_verified'            => $isVerified,
                'recommendation_score'   => $scores['recommendation_score'] ?? null,
                'semantic_match_score'   => $scores['semantic_match_score'] ?? null,
                'skill_overlap_score'    => $scores['skill_overlap_score'] ?? null,
                'distance_score'         => $scores['distance_score'] ?? null,
                'availability_score'     => $scores['availability_score'] ?? null,
                'trust_score'            => $scores['trust_score'] ?? null,
                'matched_skills'         => $scores['matched_skills'] ?? [],
                'missing_skills'         => $scores['missing_skills'] ?? [],
                'distance_km'            => $scores['distance_km'] ?? null,
                'recommendation_reason'  => $scores['recommendation_reason'] ?? null,
            ]);
        });

        // Sort by recommendation_score descending (nulls last) — within-page only
        $items = $items->sortByDesc(fn ($item) => $item['recommendation_score'] ?? -1)->values();

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $applications->currentPage(),
                'last_page'    => $applications->lastPage(),
                'per_page'     => $applications->perPage(),
                'total'        => $applications->total(),
            ],
        ]);
    }

    public function accept(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $application = Application::whereHas('task', function ($q) use ($ngo) {
            $q->where('ngo_id', $ngo->id);
        })->findOrFail($id);

        if ($application->status !== 'Pending') {
            return response()->json([
                'message' => 'Application already processed'
            ], 422);
        }

        if (config('schedule-conflict.check_on_accept')) {
            $conflicts = $this->scheduleConflictService->checkTask(
                $application->volunteer_profile_id,
                $application->task_id
            );
            $resolution = config('schedule-conflict.default_resolution', 'warn_ngo');
            if ($resolution === 'reject' && $conflicts['has_conflicts']) {
                return response()->json([
                    'message' => 'Cannot accept: schedule conflict detected',
                    'conflicts' => $conflicts['conflicts'],
                ], 409);
            }
        }

        $application->update([
            'status' => 'Accepted',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        ApplicationStatusChanged::dispatch($application->volunteer_profile_id, $application->id, 'Accepted');

        $volunteerUser = $application->volunteer->user ?? null;
        if ($volunteerUser) {
            app(NotificationService::class)->volunteerAccepted(
                $volunteerUser->id,
                $request->user()->ngoProfile->organization_name,
                $application->task->title
            );
        }

        return response()->json([
            'message' => 'Application accepted',
            'data' => $application->load(['volunteer.user', 'volunteer.skills', 'task'])
        ]);
    }

    public function reject(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $application = Application::whereHas('task', function ($q) use ($ngo) {
            $q->where('ngo_id', $ngo->id);
        })->findOrFail($id);

        if ($application->status !== 'Pending') {
            return response()->json([
                'message' => 'Application already processed'
            ], 422);
        }

        $application->update([
            'status' => 'Rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        ApplicationStatusChanged::dispatch($application->volunteer_profile_id, $application->id, 'Rejected');

        $volunteerUser = $application->volunteer->user ?? null;
        if ($volunteerUser) {
            app(NotificationService::class)->volunteerRejected(
                $volunteerUser->id,
                $request->user()->ngoProfile->organization_name,
                $application->task->title
            );
        }

        return response()->json([
            'message' => 'Application rejected',
            'data' => $application->load(['volunteer.user', 'volunteer.skills', 'task'])
        ]);
    }

    public function cancel(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $application = Application::whereHas('task', function ($q) use ($ngo) {
            $q->where('ngo_id', $ngo->id);
        })->findOrFail($id);

        if ($application->status !== 'Accepted') {
            return response()->json([
                'message' => 'Only accepted assignments can be cancelled'
            ], 422);
        }

        $application->update([
            'status' => 'Cancelled',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        ApplicationStatusChanged::dispatch($application->volunteer_profile_id, $application->id, 'Cancelled');

        return response()->json([
            'message' => 'Assignment cancelled',
            'data' => $application->load(['volunteer.user', 'volunteer.skills', 'task'])
        ]);
    }

    public function assignments(Request $request)
    {
        $ngo = $request->user()->ngoProfile;

        // Active task statuses — tasks that still require monitoring.
        // Completed and Cancelled tasks are excluded from the default assignment view.
        $activeTaskStatuses = ['Open', 'Ongoing', 'Draft'];

        $query = Application::whereHas('task', function ($q) use ($ngo, $activeTaskStatuses) {
            $q->where('ngo_id', $ngo->id)
              ->whereIn('status', $activeTaskStatuses);
        })->where('status', 'Accepted')
            ->with([
                'volunteer.user',
                'volunteer.skills',
                'volunteer.documents' => function ($q) {
                    $q->where('status', 'verified');
                },
                'task',
            ]);

        $perPage = min((int) $request->input('per_page', 20), 50);
        $assignments = $query->orderBy('reviewed_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $assignments->items(),
            'meta' => [
                'current_page' => $assignments->currentPage(),
                'last_page' => $assignments->lastPage(),
                'per_page' => $assignments->perPage(),
                'total' => $assignments->total(),
            ],
        ]);
    }
}
