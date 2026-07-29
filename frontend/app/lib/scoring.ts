// app/lib/scoring.ts
// ─────────────────────────────────────────────────────────────────────────────
// Display utilities for the Hybrid Recommendation Algorithm output.
// All scores are computed by the backend RecommendationService.
// These helpers only format and explain the values — they do NOT recalculate.
// ─────────────────────────────────────────────────────────────────────────────

export interface RecommendationScores {
  recommendation_score?: number;
  match_score?: number;
  semantic_match_score?: number;
  skill_overlap_score?: number;
  distance_score?: number;
  availability_score?: number;
  trust_score?: number;
}

export interface SkillRef {
  id: number;
  name: string;
}

export interface MatchAnalysis extends RecommendationScores {
  matched_skills?: SkillRef[];
  missing_skills?: SkillRef[];
  distance_km?: number | null;
  recommendation_reason?: string;
  rank?: number | null;
}

// ─── Overall score ────────────────────────────────────────────────────────────

export function getOverallScore(scores: RecommendationScores): number {
  return scores.recommendation_score ?? scores.match_score ?? 0;
}

// ─── Human-readable explanation (frontend fallback if backend reason absent) ──

export function generateExplanation(scores: RecommendationScores & { distance_km?: number | null }): string[] {
  const reasons: string[] = [];

  const semantic    = scores.semantic_match_score ?? 0;
  const skill       = scores.skill_overlap_score ?? 0;
  const distance    = scores.distance_score ?? 0;
  const availability = scores.availability_score ?? 0;
  const trust       = scores.trust_score ?? 0;
  const distanceKm  = scores.distance_km;

  if (semantic >= 0.75) {
    reasons.push('Very high semantic similarity');
  } else if (semantic >= 0.5) {
    reasons.push('Good semantic match');
  } else if (semantic >= 0.25) {
    reasons.push('Partial semantic similarity');
  }

  if (skill >= 0.75) {
    reasons.push('Excellent skill overlap');
  } else if (skill >= 0.5) {
    reasons.push('Strong skill match');
  } else if (skill >= 0.25) {
    reasons.push('Partial skill match');
  }

  if (distanceKm != null) {
    if (distanceKm < 10) {
      reasons.push(`Only ${distanceKm} km away`);
    } else if (distanceKm < 50) {
      reasons.push(`${distanceKm} km away — nearby`);
    } else if (distance >= 0.4) {
      reasons.push(`${distanceKm} km — reasonable distance`);
    }
  } else if (distance >= 0.7) {
    reasons.push('Nearby location');
  } else if (distance >= 0.4) {
    reasons.push('Reasonable distance');
  }

  if (availability >= 0.9) {
    reasons.push('Currently available');
  } else if (availability >= 0.7) {
    reasons.push('Good availability overlap');
  }

  if (trust >= 0.8) {
    reasons.push('High trust score');
  } else if (trust >= 0.6) {
    reasons.push('Established volunteer');
  }

  if (reasons.length === 0) {
    reasons.push('General match');
  }

  return reasons;
}

// ─── Color helpers ────────────────────────────────────────────────────────────

export function getMatchColor(score: number): string {
  if (score >= 70) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-gray-100 text-gray-500 border-gray-200';
}

export function getMatchBadgeColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-gray-400';
}

export function getScoreBarColor(value: number): string {
  if (value >= 0.7) return 'bg-green-500';
  if (value >= 0.4) return 'bg-yellow-500';
  return 'bg-gray-400';
}

export function getScoreRingColor(score: number): string {
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-gray-500';
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatScore(value: number | undefined | null): string {
  if (value === undefined || value === null) return 'N/A';
  return (value * 100).toFixed(0);
}

export function formatPct(value: number | undefined | null): string {
  if (value === undefined || value === null) return '—';
  // If backend already sends 0-100 (recommendation_score), use directly
  // If 0-1 (sub-scores), multiply
  return `${value <= 1 ? Math.round(value * 100) : Math.round(value)}%`;
}

// ─── Score label ─────────────────────────────────────────────────────────────

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Great';
  if (score >= 55) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Low';
}
