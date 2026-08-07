<?php

namespace App\Services;

use App\Algorithms\Contracts\SimilarityCalculatorInterface;
use App\Algorithms\Matching\HaversineDistance;
use App\Models\Task;
use App\Models\VolunteerProfile;
use Illuminate\Database\Eloquent\Collection;

class RecommendationService
{
    private array $trustScoreCache = [];
    private array $scoreCache = [];

    public function __construct(
        private SimilarityCalculatorInterface $similarity,
        private HaversineDistance $distance,
        private TrustScoreService $trustService
    ) {}

    public function computeAllScores(
        VolunteerProfile $volunteer,
        Task $task
    ): array {
        $cacheKey = $volunteer->id . ':' . $task->id;

        if (isset($this->scoreCache[$cacheKey])) {
            return $this->scoreCache[$cacheKey];
        }

        $volunteer->loadMissing('skills');
        $task->loadMissing('skills');

        $semanticScore = $this->semanticMatchScore($volunteer, $task);
        $distanceScore = $this->geographicDistanceScore($volunteer, $task);
        $skillScore = $this->skillOverlapScore($volunteer, $task);
        $availabilityScore = $this->availabilityOverlapScore($volunteer, $task);
        $trustScore = $this->getTrustScore($volunteer);

        $finalScore = $this->weightedScore(
            $semanticScore,
            $distanceScore,
            $skillScore,
            $availabilityScore,
            $trustScore
        );

        return $this->scoreCache[$cacheKey] = [
            'recommendation_score' => round($finalScore * 100, 1),
            'semantic_match_score' => round($semanticScore, 4),
            'distance_score' => round($distanceScore, 4),
            'skill_overlap_score' => round($skillScore, 4),
            'availability_score' => round($availabilityScore, 4),
            'trust_score' => round($trustScore, 4),
        ];
    }

    /**
     * Compute all scores PLUS rich metadata:
     * matched_skills, missing_skills, distance_km, recommendation_reason
     * Does NOT change any score values — only enriches the payload.
     */
    public function computeDetailedScores(
        VolunteerProfile $volunteer,
        Task $task
    ): array {
        $volunteer->loadMissing('skills');
        $task->loadMissing('skills');

        $base = $this->computeAllScores($volunteer, $task);

        // ── Skill breakdown ──────────────────────────────────────────────
        $volunteerSkillIds = $volunteer->skills->pluck('id')->toArray();
        $taskSkills        = $task->skills;

        $matched = $taskSkills->filter(fn ($s) => in_array($s->id, $volunteerSkillIds))
                              ->values()
                              ->map(fn ($s) => ['id' => $s->id, 'name' => $s->name]);

        $missing = $taskSkills->filter(fn ($s) => !in_array($s->id, $volunteerSkillIds))
                              ->values()
                              ->map(fn ($s) => ['id' => $s->id, 'name' => $s->name]);

        // ── Distance in km ───────────────────────────────────────────────
        $distanceKm = null;
        if ($volunteer->latitude && $volunteer->longitude && $task->latitude && $task->longitude) {
            $distanceKm = round($this->distance->calculate(
                $volunteer->latitude,
                $volunteer->longitude,
                $task->latitude,
                $task->longitude
            ), 1);
        }

        // ── Human-readable recommendation reason ─────────────────────────
        $reason = $this->buildRecommendationReason($base, $distanceKm);

        return array_merge($base, [
            'matched_skills'         => $matched->toArray(),
            'missing_skills'         => $missing->toArray(),
            'distance_km'            => $distanceKm,
            'recommendation_reason'  => $reason,
        ]);
    }

    /**
     * Build a concise, human-readable explanation from score outputs.
     */
    public function buildRecommendationReason(array $scores, ?float $distanceKm = null): string
    {
        $parts = [];

        $overall    = $scores['recommendation_score'] ?? 0;
        $semantic   = $scores['semantic_match_score'] ?? 0;
        $skill      = $scores['skill_overlap_score'] ?? 0;
        $distance   = $scores['distance_score'] ?? 0;
        $avail      = $scores['availability_score'] ?? 0;
        $trust      = $scores['trust_score'] ?? 0;

        // Overall label
        if ($overall >= 80) {
            $parts[] = 'Excellent overall fit.';
        } elseif ($overall >= 60) {
            $parts[] = 'Good overall fit.';
        } elseif ($overall >= 40) {
            $parts[] = 'Moderate fit.';
        }

        // Semantic
        if ($semantic >= 0.75) {
            $parts[] = 'Very high semantic similarity.';
        } elseif ($semantic >= 0.5) {
            $parts[] = 'Good semantic match.';
        } elseif ($semantic >= 0.25) {
            $parts[] = 'Partial semantic similarity.';
        }

        // Skill
        if ($skill >= 0.75) {
            $parts[] = 'Excellent skill overlap.';
        } elseif ($skill >= 0.5) {
            $parts[] = 'Strong skill match.';
        } elseif ($skill >= 0.25) {
            $parts[] = 'Partial skill match.';
        }

        // Distance
        if ($distanceKm !== null) {
            if ($distanceKm < 10) {
                $parts[] = "Only {$distanceKm} km away.";
            } elseif ($distanceKm < 50) {
                $parts[] = "{$distanceKm} km away — nearby.";
            } elseif ($distance >= 0.4) {
                $parts[] = "{$distanceKm} km away — reasonable distance.";
            }
        } elseif ($distance >= 0.7) {
            $parts[] = 'Nearby location.';
        }

        // Availability
        if ($avail >= 0.9) {
            $parts[] = 'Volunteer is currently available.';
        } elseif ($avail >= 0.7) {
            $parts[] = 'Good availability overlap.';
        }

        // Trust
        if ($trust >= 0.8) {
            $parts[] = 'High trust score from previous service.';
        } elseif ($trust >= 0.6) {
            $parts[] = 'Established volunteer record.';
        }

        return empty($parts) ? 'General recommendation based on profile match.' : implode(' ', $parts);
    }

    public function computeVolunteerTaskScore(
        VolunteerProfile $volunteer,
        Task $task
    ): float {
        $scores = $this->computeAllScores($volunteer, $task);
        return $scores['recommendation_score'] / 100;
    }

    public function computeVolunteerTaskMatchScore(
        VolunteerProfile $volunteer,
        Task $task
    ): float {
        return $this->computeAllScores($volunteer, $task)['recommendation_score'];
    }

    public function getTaskDetail(int $taskId): Task
    {
        return Task::with([
                'ngo.user',
                'skills',
                'category',
            ])
            ->whereHas('ngo', function ($query) {
                $query->where('verification_status', 'verified');
            })
            ->findOrFail($taskId);
    }

    public function getTrustScore(VolunteerProfile $volunteer): float
    {
        $id = $volunteer->id;

        if (isset($this->trustScoreCache[$id])) {
            return $this->trustScoreCache[$id];
        }

        if (
            !$volunteer->trust_updated_at ||
            $volunteer->trust_updated_at->diffInHours(now()) > 1
        ) {
            $volunteer = $this->trustService->recalculate($volunteer);
        }

        return $this->trustScoreCache[$id] = $volunteer->trust_score ?? 0.5;
    }

    public function rankTasksForVolunteer(
        VolunteerProfile $volunteer,
        array $filters = []
    ): Collection {
        $volunteer->loadMissing('skills');

        // Discovery: show all active tasks from verified NGOs.
        // Matching/TF-IDF scoring must NOT hide tasks before application —
        // scoring is applied only after a volunteer applies.
        $query = Task::whereIn('status', ['Open', 'Ongoing'])
            ->whereHas('ngo', function ($q) {
                $q->where('verification_status', 'verified');
            })
            ->with(['ngo.user', 'skills']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['urgency_level'])) {
            $query->where('urgency_level', $filters['urgency_level']);
        }

        if (!empty($filters['task_type'])) {
            $query->where('task_type', $filters['task_type']);
        }

        if (!empty($filters['location'])) {
            $query->where(function ($q) use ($filters) {
                $loc = $filters['location'];
                $q->where('location', 'like', "%{$loc}%")
                  ->orWhere('city', 'like', "%{$loc}%")
                  ->orWhere('country', 'like', "%{$loc}%");
            });
        }

        if (!empty($filters['skill'])) {
            $query->whereHas('skills', function ($q) use ($filters) {
                $q->where('skills.name', 'like', "%{$filters['skill']}%");
            });
        }

        if (!empty($filters['date_from'])) {
            $query->where('start_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('end_date', '<=', $filters['date_to']);
        }

        $tasks = $query->get();

        $tasks->each(function ($task) use ($volunteer) {
            $detailed = $this->computeDetailedScores($volunteer, $task);
            $task->recommendation_score  = $detailed['recommendation_score'];
            $task->match_score           = $detailed['recommendation_score'];
            $task->semantic_match_score  = $detailed['semantic_match_score'];
            $task->distance_score        = $detailed['distance_score'];
            $task->skill_overlap_score   = $detailed['skill_overlap_score'];
            $task->availability_score    = $detailed['availability_score'];
            $task->trust_score           = $detailed['trust_score'];
            $task->matched_skills        = $detailed['matched_skills'];
            $task->missing_skills        = $detailed['missing_skills'];
            $task->distance_km           = $detailed['distance_km'];
            $task->recommendation_reason = $detailed['recommendation_reason'];
        });

        $sorted = $tasks->sortByDesc('recommendation_score')->values();

        $sorted->each(function ($t, $index) {
            $t->rank = $index + 1;
        });

        return $sorted;
    }

    private function semanticMatchScore(
        VolunteerProfile $volunteer,
        Task $task
    ): float {
        return $this->similarity->calculate(
            $volunteer->tfidf_vector ?? [],
            $task->tfidf_vector ?? []
        );
    }

    private function geographicDistanceScore(
        VolunteerProfile $volunteer,
        Task $task
    ): float {
        if (
            !$volunteer->latitude ||
            !$volunteer->longitude ||
            !$task->latitude ||
            !$task->longitude
        ) {
            return 0.5;
        }

        $km = $this->distance->calculate(
            $volunteer->latitude,
            $volunteer->longitude,
            $task->latitude,
            $task->longitude
        );

        return max(0, min(1, 1 - ($km / 500)));
    }

    private function skillOverlapScore(
        VolunteerProfile $volunteer,
        Task $task
    ): float {
        $volunteerSkills = $volunteer->skills->pluck('id')->toArray();
        $taskSkills = $task->skills->pluck('id')->toArray();

        if (empty($taskSkills)) {
            return 0.5;
        }

        if (empty($volunteerSkills)) {
            return 0;
        }

        $intersection = array_intersect($volunteerSkills, $taskSkills);
        $union = array_unique(array_merge($volunteerSkills, $taskSkills));

        $jaccard = count($intersection) / max(count($union), 1);

        $requiredCoverage = count($intersection) / max(count($taskSkills), 1);

        return (0.5 * $jaccard) + (0.5 * $requiredCoverage);
    }

    private function availabilityOverlapScore(
        VolunteerProfile $volunteer,
        Task $task
    ): float {
        $volAvailability = $volunteer->availability;

        if (
            $volAvailability &&
            in_array($volAvailability, ['Unavailable', 'Busy'])
        ) {
            return 0.1;
        }

        $taskStart = $task->start_date;
        $taskEnd = $task->end_date;

        if (!$taskStart && !$taskEnd) {
            return $volAvailability === 'Available' ? 1.0 : 0.8;
        }

        $now = now();

        if ($taskStart && $taskStart->isPast() && $taskEnd && $taskEnd->isPast()) {
            return 0.3;
        }

        if ($taskStart && $taskStart->isPast() && (!$taskEnd || $taskEnd->isFuture())) {
            return 0.7;
        }

        if ($taskStart && $taskStart->isFuture()) {
            return 0.9;
        }

        return 0.5;
    }

    private function weightedScore(
        float $semantic,
        float $distance,
        float $skill,
        float $availability,
        float $trust
    ): float {
        $w = config('workflow.strategies.recommendation.weights');

        return min(1.0, max(0.01,
            ($w['semantic'] * $semantic) +
            ($w['distance'] * $distance) +
            ($w['skill'] * $skill) +
            ($w['availability'] * $availability) +
            ($w['trust'] * $trust)
        ));
    }
}
