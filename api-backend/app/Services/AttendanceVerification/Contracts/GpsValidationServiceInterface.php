<?php

namespace App\Services\AttendanceVerification\Contracts;

use App\Models\Task;

interface GpsValidationServiceInterface
{
    public function validate(float $latitude, float $longitude, float $accuracy, Task $task): array;
}
