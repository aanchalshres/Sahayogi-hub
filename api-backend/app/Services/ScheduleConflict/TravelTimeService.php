<?php

namespace App\Services\ScheduleConflict;

use App\Algorithms\Matching\HaversineDistance;

class TravelTimeService
{
    private array $config;

    public function __construct(
        private HaversineDistance $distance
    ) {
        $this->config = config('schedule-conflict');
    }

    public function estimateMinutes(
        ?float $lat1, ?float $lng1,
        ?float $lat2, ?float $lng2
    ): int {
        $distance = $this->distanceKm($lat1, $lng1, $lat2, $lng2);
        if ($distance === null) return 0;

        $speed = $this->config['travel_speed_kmh'] ?? 30;
        $hours = $distance / max($speed, 1);

        return (int)ceil($hours * 60);
    }

    public function distanceKm(
        ?float $lat1, ?float $lng1,
        ?float $lat2, ?float $lng2
    ): ?float {
        if ($lat1 === null || $lng1 === null || $lat2 === null || $lng2 === null) {
            return null;
        }

        return round($this->distance->calculate($lat1, $lng1, $lat2, $lng2), 2);
    }
}
