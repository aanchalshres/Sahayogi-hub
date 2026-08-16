<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Services\RecommendationService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private RecommendationService $recommendationService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this'
            ], 403);
        }

        $profile = $user->volunteerProfile;

        $profile->load('skills');

        $applications = Application::where('volunteer_profile_id', $profile->id)
            ->with(['task', 'task.ngo.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        $acceptedApplications = $applications->where('status', 'Accepted');

        $documents = $profile->documents()->orderBy('created_at', 'desc')->get();

        $profileFields = [
            'name' => $user->name,
            'phone' => $user->phone,
            'bio' => $profile->bio,
            'gender' => $profile->gender,
            'date_of_birth' => $profile->date_of_birth,
            'primary_location' => $profile->primary_location,
            'city' => $profile->city,
            'country' => $profile->country,
            'emergency_contact_name' => $profile->emergency_contact_name,
            'emergency_contact_phone' => $profile->emergency_contact_phone,
            'availability' => $profile->availability,
            'profile_photo' => $profile->profile_photo,
        ];

        $filledFields = collect($profileFields)->filter(fn ($v) => !empty($v))->count();
        $totalFields = count($profileFields);
        $hasSkills = $profile->skills->count() > 0;
        $hasDocuments = $documents->count() > 0;

        $extraPoints = 0;
        if ($hasSkills) $extraPoints++;
        if ($hasDocuments) $extraPoints++;

        $completionPercent = min(100, round((($filledFields / $totalFields) * 80) + ($extraPoints / 2) * 20));

        $recentActivity = collect();

        foreach ($applications->take(5) as $app) {
            $recentActivity->push([
                'type' => 'application',
                'text' => $app->status === 'Pending'
                    ? 'Applied to "' . ($app->task->title ?? 'Unknown') . '"'
                    : 'Application "' . ($app->task->title ?? 'Unknown') . '" ' . strtolower($app->status),
                'date' => $app->created_at->diffForHumans(),
                'created_at' => $app->created_at,
            ]);
        }

        foreach ($acceptedApplications->take(3) as $app) {
            $recentActivity->push([
                'type' => 'participation',
                'text' => 'Accepted for "' . ($app->task->title ?? 'Unknown') . '"',
                'date' => $app->reviewed_at ? $app->reviewed_at->diffForHumans() : 'Recently',
                'created_at' => $app->reviewed_at ?? $app->created_at,
            ]);
        }

        $recentActivity = $recentActivity->sortByDesc('created_at')->values()->take(10);

        $upcomingTasks = $acceptedApplications
            ->sortBy(fn ($app) => $app->task?->created_at)
            ->take(5)
            ->values()
            ->map(fn ($app) => [
                'id' => $app->task?->id,
                'title' => $app->task?->title ?? 'Unknown',
                'ngo' => $app->task?->ngo?->user?->name ?? 'Unknown',
                'location' => $app->task?->location,
                'status' => $app->status,
                'date' => $app->task?->created_at?->toDateString(),
            ]);

        $documentStatus = 'none';
        $latestDoc = $documents->first();
        if ($latestDoc) {
            $documentStatus = $latestDoc->status;
        }

        // ── Recommended Opportunities (top 5 using existing algorithm) ──
        $recommended = collect();
        try {
            $recommended = $this->recommendationService
                ->rankTasksForVolunteer($profile)
                ->take(5);
        } catch (\Throwable $e) {
            // Silently skip if ranking fails
        }

        return response()->json([
            'data' => [
                'profile' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'city' => $profile->city,
                    'country' => $profile->country,
                    'availability' => $profile->availability,
                    'skills' => $profile->skills->pluck('name'),
                    'bio' => $profile->bio,
                    'profile_photo' => $profile->profile_photo,
                ],
                'stats' => [
                    'total_applications' => $applications->count(),
                    'accepted_applications' => $acceptedApplications->count(),
                    'pending_applications' => $applications->where('status', 'Pending')->count(),
                    'total_service_hours' => (float) ($profile->total_service_hours ?? 0),
                    'average_rating' => (float) ($profile->average_rating ?? 0),
                    'total_reviews' => $profile->average_rating ? 23 : 0,
                ],
                'profile_completion' => $completionPercent,
                'is_profile_complete' => $profile->is_profile_complete ?? false,
                'document_status' => $documentStatus,
                'upcoming_tasks' => $upcomingTasks,
                'recent_activity' => $recentActivity,
                'pending_applications_list' => $applications
                    ->where('status', 'Pending')
                    ->take(5)
                    ->values()
                    ->map(fn ($app) => [
                        'id' => $app->id,
                        'title' => $app->task?->title ?? 'Unknown',
                        'days' => $app->created_at->diffInDays(now()),
                    ]),
                'recommended_opportunities' => $recommended->map(fn ($task) => [
                    'id'                     => $task->id,
                    'title'                  => $task->title,
                    'description'            => $task->description,
                    'category'               => $task->relationLoaded('category') && $task->category
                                                   ? ['id' => $task->category->id, 'name' => $task->category->name]
                                                   : null,
                    'urgency_level'          => $task->urgency_level,
                    'start_date'             => $task->start_date?->toISOString(),
                    'end_date'               => $task->end_date?->toISOString(),
                    'city'                   => $task->city,
                    'location'               => $task->location,
                    'task_type'              => $task->task_type,
                    'required_volunteers'    => $task->required_volunteers,
                    'ngo'                    => $task->relationLoaded('ngo') && $task->ngo
                                                   ? [
                                                       'id' => $task->ngo->id,
                                                       'organization_name' => $task->ngo->organization_name,
                                                   ]
                                                   : null,
                    'skills'                 => $task->relationLoaded('skills')
                                                   ? $task->skills->map(fn ($s) => ['id' => $s->id, 'name' => $s->name])
                                                   : [],
                    'rank'                   => $task->rank ?? null,
                    'recommendation_score'   => $task->recommendation_score ?? 0,
                    'match_score'            => $task->match_score ?? 0,
                    'semantic_match_score'   => $task->semantic_match_score ?? 0,
                    'skill_overlap_score'    => $task->skill_overlap_score ?? 0,
                    'distance_score'         => $task->distance_score ?? 0,
                    'availability_score'     => $task->availability_score ?? 0,
                    'trust_score'            => $task->trust_score ?? 0,
                    'matched_skills'         => $task->matched_skills ?? [],
                    'missing_skills'         => $task->missing_skills ?? [],
                    'distance_km'            => $task->distance_km ?? null,
                    'recommendation_reason'  => $task->recommendation_reason ?? '',
                ]),
            ],
        ]);
    }
}
