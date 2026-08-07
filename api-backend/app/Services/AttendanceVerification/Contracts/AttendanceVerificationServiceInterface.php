<?php

namespace App\Services\AttendanceVerification\Contracts;

use App\Models\ServiceLog;
use App\Models\Task;
use App\Models\VolunteerProfile;

interface AttendanceVerificationServiceInterface
{
    /**
     * Mark GPS-verified attendance for a volunteer at a task location.
     * This records presence only — it does NOT complete the task.
     */
    public function markAttendance(
        VolunteerProfile $volunteer,
        Task $task,
        array $gpsData,
        ?array $deviceInfo = null
    ): ServiceLog;

    /**
     * Legacy check-out: updates an active service log to completed.
     * Task completion itself is handled separately by the NGO.
     */
    public function checkOut(
        ServiceLog $log,
        array $gpsData,
        ?array $deviceInfo = null
    ): ServiceLog;
}
