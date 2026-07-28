<?php

namespace App\Http\Controllers\Ngo;

use App\Events\TrustScore\ApplicationStatusChanged;
use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Services\NotificationService;
use App\Services\ScheduleConflict\ScheduleConflictService;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function __construct(
        private ScheduleConflictService $scheduleConflictService
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
            'task',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('task_id')) {
            $query->where('task_id', $request->task_id);
        }

        $perPage = min((int) $request->input('per_page', 20), 50);
        $applications = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $applications->items(),
            'meta' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'per_page' => $applications->perPage(),
                'total' => $applications->total(),
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

        $query = Application::whereHas('task', function ($q) use ($ngo) {
            $q->where('ngo_id', $ngo->id);
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
