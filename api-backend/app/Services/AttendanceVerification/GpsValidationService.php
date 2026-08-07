<?php

namespace App\Services\AttendanceVerification;

use App\Algorithms\Matching\HaversineDistance;
use App\Models\Task;
use App\Services\AttendanceVerification\Contracts\GpsValidationServiceInterface;

class GpsValidationService implements GpsValidationServiceInterface
{
    public function __construct(
        private HaversineDistance $haversine,
        private array $config = []
    ) {
        $this->config = config('attendance-verification.gps', []);
    }

    public function validate(float $latitude, float $longitude, float $accuracy, Task $task): array
    {
        $maxDistance = $this->config['max_distance_meters'] ?? 500;
        $maxAccuracy = $this->config['max_accuracy_meters'] ?? 50;
        $requireGps = $this->config['require_gps'] ?? true;

        $errors = [];
        $score = 100;

        if ($requireGps && ($latitude === 0.0 && $longitude === 0.0)) {
            return [
                'valid' => false,
                'score' => 0,
                'distance' => null,
                'accuracy' => $accuracy,
                'errors' => ['GPS coordinates not available'],
            ];
        }

        if ($accuracy > $maxAccuracy) {
            $score -= 30;
            $errors[] = "GPS accuracy ({$accuracy}m) exceeds max ({$maxAccuracy}m)";
        }

        $taskLat = $task->latitude ? (float) $task->latitude : null;
        $taskLng = $task->longitude ? (float) $task->longitude : null;

        if ($taskLat === null || $taskLng === null) {
            return [
                'valid' => true,
                'score' => $score,
                'distance' => null,
                'accuracy' => $accuracy,
                'warnings' => ['Task has no location set; distance check skipped'],
            ];
        }

        // Shared Haversine implementation (returns km) converted to meters.
        $distance = $this->haversine->calculate($latitude, $longitude, $taskLat, $taskLng) * 1000;

        if ($distance > $maxDistance) {
            $errors[] = "Distance from task ({$distance}m) exceeds max ({$maxDistance}m)";
            $score -= 100;
        } else {
            $proximityRatio = 1 - ($distance / $maxDistance);
            $score = $score * (0.3 + 0.7 * $proximityRatio);
        }

        return [
            'valid' => count($errors) === 0 || $distance <= $maxDistance,
            'score' => max(0, min(100, $score)),
            'distance' => $distance,
            'accuracy' => $accuracy,
            'errors' => $errors,
        ];
    }
}
