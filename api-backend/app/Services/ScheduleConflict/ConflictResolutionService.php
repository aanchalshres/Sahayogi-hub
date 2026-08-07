<?php

namespace App\Services\ScheduleConflict;

use App\Models\ScheduleConflict;
use App\Services\ActivityLogService;

class ConflictResolutionService
{
    public function __construct(
        private ActivityLogService $activityLog,
    ) {}

    public function resolve(int $conflictId, string $resolution, int $resolvedBy, ?string $notes = null): ScheduleConflict
    {
        $conflict = ScheduleConflict::findOrFail($conflictId);

        $conflict->update([
            'resolution' => $resolution,
            'resolved_at' => now(),
            'resolved_by' => $resolvedBy,
            'notes' => $notes,
        ]);

        $this->activityLog->log($resolvedBy, 'conflict_resolved', 'schedule_conflict',
            "Conflict #{$conflictId} resolved as: {$resolution}");

        return $conflict->fresh();
    }
}
