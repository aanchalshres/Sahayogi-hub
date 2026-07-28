# Sahayogi — Algorithm Analysis

## 1. TF-IDF Vectorization

### Purpose
Converts free-text descriptions (volunteer bios, task descriptions) into numerical feature vectors so semantic similarity can be computed mathematically.

### Where It Is Used
- `TfIdfVectorizer.php` — core implementation
- `TfIdfGenerationService.php` — auto-generates vectors on volunteer/task save
- `Observers/TaskObserver.php`, `Observers/VolunteerProfileObserver.php` — trigger regeneration
- `RecommendationService.php` — consumes vectors for semantic matching

### Working Principle
1. **Tokenization**: Lowercase text, remove non-alphanumeric chars, split on whitespace, strip stop words (the, a, an, and, or, etc.)
2. **Term Frequency (TF)**: Count occurrences of each term, divide by total terms in document
3. **Inverse Document Frequency (IDF)**: Log-scaled inverse of the fraction of documents containing the term (with add-1 smoothing)
4. **TF-IDF Weight**: Multiply TF by IDF for each term
5. **Output**: A sparse vector of `{term => weight}` pairs, sorted descending by weight

### Mathematical Formula

$$\text{TF}(t, d) = \frac{f_{t,d}}{|d|}$$

Where $f_{t,d}$ = raw count of term $t$ in document $d$, and $|d|$ = total terms in $d$.

$$\text{IDF}(t, D) = \ln\left(\frac{N + 1}{n_t + 1}\right) + 1$$

Where $N$ = total documents, $n_t$ = number of documents containing $t$. The project uses smooth IDF (add-1 smoothing).

$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \text{IDF}(t, D)$$

### Implementation Details
```php
// For each document
foreach (array_count_values($terms) as $term => $count) {
    $tf[$term] = $count / max($termCount, 1);   // normalized TF
}
// For each term across all docs
$idf = log(($totalDocs + 1) / (($documentFrequency[$term] ?? 0) + 1)) + 1;
$weight = $tfScore * $idf;  // final TF-IDF
```

Vectors are stored as JSON in the `tfidf_vector` column of `volunteer_profiles` and `tasks` tables.

### Input and Output
- **Input**: Array of `['id' => int, 'text' => string]` documents
- **Output**: `[id => [term => weight, ...], ...]` — associative arrays keyed by document ID

### Time and Space Complexity
- **Time**: $O(N \cdot L)$ where $N$ = number of documents, $L$ = average document length
- **Space**: $O(N \cdot T)$ where $T$ = unique terms across all documents

### Advantages and Limitations
- **Advantages**: Simple, interpretable feature representation; works well for text matching
- **Limitations**: No semantic understanding (e.g., "teach" and "teaching" are distinct); sparse high-dimensional vectors; no word order information

### Example
**Volunteer bio**: `"I love teaching math and science"`
**Task description**: `"Need a math tutor for students"`

Tokenization (after stop-word removal): `["love", "teaching", "math", "science"]` and `["need", "math", "tutor", "students"]`

TF for "math" in volunteer = $1/4 = 0.25$; in task = $1/4 = 0.25$
IDF for "math" (2 docs, appears in both): $\ln((2+1)/(2+1)) + 1 = \ln(1) + 1 = 1$
TF-IDF for "math" = $0.25 \times 1 = 0.25$ in both vectors.

---

## 2. Cosine Similarity

### Purpose
Measures the cosine of the angle between two TF-IDF vectors to quantify semantic similarity (0 = orthogonal/unrelated, 1 = identical direction).

### Where It Is Used
- `App\Algorithms\Matching\CosineSimilarity.php`
- Called by `RecommendationService::semanticMatchScore()` with volunteer and task TF-IDF vectors

### Working Principle
Treat each TF-IDF vector as a point in high-dimensional space. Compute the dot product divided by the product of the magnitudes. The result is the cosine of the angle between the vectors.

### Mathematical Formula

$$\text{cosine\_similarity}(\vec{A}, \vec{B}) = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \cdot \|\vec{B}\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \cdot \sqrt{\sum_{i=1}^{n} B_i^2}}$$

Where $\vec{A}$ and $\vec{B}$ are TF-IDF vectors (sparse, containing only dimensions with non-zero weight).

### Implementation Details
```php
foreach ($vectorA as $term => $weight) {
    $dotProduct += $weight * ($vectorB[$term] ?? 0);
    $magnitudeA += $weight ** 2;
}
foreach ($vectorB as $weight) {
    $magnitudeB += $weight ** 2;
}
return $dotProduct / (sqrt($magnitudeA) * sqrt($magnitudeB));
```

Handles sparse vectors efficiently — only iterates over non-zero elements of `$vectorA` for the dot product, and skips terms absent from either vector (treated as 0).

### Input and Output
- **Input**: Two associative arrays `[term => weight, ...]`
- **Output**: Float in $[0, 1]$, where 1 = identical direction, 0 = orthogonal

### Time and Space Complexity
- **Time**: $O(|A| + |B|)$ where $|A|$ and $|B|$ are the number of non-zero terms in each vector
- **Space**: $O(1)$

### Example
**Vector A** (volunteer): `{"math": 0.25, "teach": 0.35, "science": 0.20}`
**Vector B** (task): `{"math": 0.25, "tutor": 0.30, "student": 0.15}`

- Dot product: $(0.25 \times 0.25) + (0.35 \times 0) + (0.20 \times 0) + (0 \times 0.30) + (0 \times 0.15) = 0.0625$
- $|A| = \sqrt{0.25^2 + 0.35^2 + 0.20^2} = \sqrt{0.225} \approx 0.4743$
- $|B| = \sqrt{0.25^2 + 0.30^2 + 0.15^2} = \sqrt{0.175} \approx 0.4183$
- Cosine similarity = $0.0625 / (0.4743 \times 0.4183) = 0.0625 / 0.1984 \approx 0.315$

---

## 3. Haversine Distance

### Purpose
Calculates the great-circle distance between two geographic coordinates (volunteer's location and task location) in kilometers.

### Where It Is Used
- `App\Algorithms\Matching\HaversineDistance.php` — standalone implementation
- `RecommendationService::geographicDistanceScore()` — converts distance to a score
- `TravelTimeService.php` — estimates travel time
- `GpsValidationService.php` — validates attendance check-in proximity

### Working Principle
The haversine formula accounts for Earth's spherical shape by computing the central angle between two points on a sphere and multiplying by Earth's radius.

### Mathematical Formula

$$a = \sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1) \cdot \cos(\text{lat}_2) \cdot \sin^2\left(\frac{\Delta \text{lon}}{2}\right)$$

$$c = 2 \cdot \text{atan2}(\sqrt{a}, \sqrt{1-a})$$

$$d = R \cdot c$$

Where $R = 6371$ km (Earth's mean radius), lat/lon are in radians, $\Delta \text{lat} = \text{lat}_2 - \text{lat}_1$, $\Delta \text{lon} = \text{lon}_2 - \text{lon}_1$.

### Implementation Details - HaversineDistance
```php
$R = 6371;  // Earth radius in km
$dLat = deg2rad($lat2 - $lat1);
$dLon = deg2rad($lon2 - $lon1);
$a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;
return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
```

### Normalization to Distance Score
In `RecommendationService`, the raw km is converted to a score:
```php
return max(0, min(1, 1 - ($km / 500)));
```
A volunteer at the task location (0 km) scores 1.0; at 500 km or beyond scores 0.

### Input and Output
- **Input**: `(lat1, lon1, lat2, lon2)` as floats in decimal degrees
- **Output**: Distance in kilometers (float)

### Time and Space Complexity
- **Time**: $O(1)$
- **Space**: $O(1)$

### Example
**Volunteer**: (27.7172, 85.3240) — Kathmandu
**Task**: (27.6722, 85.3111) — Patan, Nepal

- $\Delta \text{lat} = 27.6722 - 27.7172 = -0.0450^\circ = -0.000785$ rad
- $\Delta \text{lon} = 85.3111 - 85.3240 = -0.0129^\circ = -0.000225$ rad
- $a \approx \sin^2(-0.000393) + \cos(0.4837) \cdot \cos(0.4829) \cdot \sin^2(-0.000113) \approx 1.54 \times 10^{-7} + 0.877 \times 0.878 \times 1.28 \times 10^{-8} \approx 1.64 \times 10^{-7}$
- $c = 2 \cdot \text{atan2}(0.000405, 0.9999999) \approx 0.000810$
- $d = 6371 \times 0.000810 \approx 5.16$ km

Distance score: $\max(0, \min(1, 1 - 5.16/500)) = 0.9897$

---

## 4. Hungarian Assignment Algorithm (Kuhn–Munkres)

### Purpose
Solves the optimal assignment problem: given $n$ volunteers and $n$ tasks (or $m$ volunteers and $k$ tasks with padding), find the minimum-cost one-to-one matching. Used for admin batch assignment of volunteers to tasks.

### Where It Is Used
- `App\Algorithms\Assignment\HungarianMatcher.php`
- `AssignmentService::batchAssign()` — builds the cost matrix from `(1 - match_score)` and invokes the solver

### Working Principle
The algorithm is a primal-dual method for the assignment problem. It maintains dual variables $u_i$ (for rows) and $v_j$ (for columns) and iteratively adjusts them to satisfy the complementary slackness conditions while building a maximum matching in the equality subgraph.

**Implementation uses the Hungarian algorithm in $O(n^3)$ time** with:
- `u`, `v`: dual potentials for rows and columns
- `p`: matching array (column → row)
- `way`: predecessor tracking for augmenting path
- `minVal`: minimum slack values for each column
- `used`: visited columns in current augmentation

### Mathematical Formulation
Given cost matrix $C$ of size $n \times n$, find permutation $\sigma$ minimizing:

$$\min_{\sigma} \sum_{i=1}^{n} C_{i, \sigma(i)}$$

The dual problem:

$$\max \sum_{i=1}^{n} u_i + \sum_{j=1}^{n} v_j \quad \text{s.t.} \quad u_i + v_j \leq C_{ij}$$

### Implementation Details
```php
// Cost matrix entry (AssignmentService)
$costMatrix[$i][$j] = 1 - $score;  // cost = complement of match score
// Pad to square matrix
for ($i = 0; $i < $size; $i++) {
    for ($j = 0; $j < $size; $j++) {
        $costMatrix[$i][$j] = $costMatrix[$i][$j] ?? 1;
    }
}
$assignments = $this->solver->solve($costMatrix);
// Result: [volunteerIndex => taskIndex, ...]
```

The output maps volunteer indices to task indices. Only valid assignments (where the application actually exists for that pair) are committed.

### Input and Output
- **Input**: Square cost matrix `float[][]` of size $\max(m, k)$ where $m$ = volunteers, $k$ = tasks
- **Output**: `array` mapping `[volunteerIndex => taskIndex]`

### Time and Space Complexity
- **Time**: $O(n^3)$ where $n = \max(\text{volunteers}, \text{tasks})$
- **Space**: $O(n^2)$ for the cost matrix (padded)

### Example
**Volunteers**: V1 (score 0.8 with T1, 0.3 with T2), V2 (0.4 with T1, 0.9 with T2)
**Cost matrix**: `[[0.2, 0.7], [0.6, 0.1]]`

The Hungarian solver finds the optimal min-cost assignment:
- V1 → T1 (cost 0.2)
- V2 → T2 (cost 0.1)
- Total cost = 0.3 (max total match score = 1.7)

---

## 5. Hybrid Weighted Recommendation Score

### Purpose
Combines five distinct component scores into a single composite recommendation score that determines how well a volunteer matches a task.

### Where It Is Used
- `RecommendationService::computeAllScores()` — computes all 5 components
- `RecommendationService::weightedScore()` — applies strategy weights
- `RecommendationService::rankVolunteersForTask()` and `rankTasksForVolunteer()`

### Component Scores

#### 5a. Semantic Match Score ($S_{sem}$)
Cosine similarity between volunteer and task TF-IDF vectors.

$$S_{sem} = \text{CosineSimilarity}(\text{TF-IDF}_{volunteer}, \text{TF-IDF}_{task}) \in [0, 1]$$

#### 5b. Geographic Distance Score ($S_{dist}$)
Normalized inverse of haversine distance.

$$S_{dist} = \max\left(0, \min\left(1, 1 - \frac{d}{500}\right)\right)$$

Where $d$ = haversine distance in km. Defaults to 0.5 if coordinates are missing.

#### 5c. Skill Overlap Score ($S_{skill}$)
Combination of Jaccard similarity and required coverage:

$$\text{Jaccard} = \frac{|V \cap T|}{|V \cup T|}$$

$$\text{Coverage} = \frac{|V \cap T|}{|T|}$$

$$S_{skill} = 0.5 \times \text{Jaccard} + 0.5 \times \text{Coverage}$$

Where $V$ = volunteer's skill IDs, $T$ = task's required skill IDs. Returns 0.5 if task has no skills, 0 if volunteer has no skills.

#### 5d. Availability Overlap Score ($S_{avail}$)
Heuristic scoring based on volunteer availability status and task date range:
- "Unavailable"/"Busy" → 0.1
- Task past → 0.3
- Task ongoing → 0.7
- Task future → 0.9
- No dates, volunteer "Available" → 1.0
- Fallback → 0.5

#### 5e. Trust Score ($S_{trust}$)
From `TrustScoreService` (see Algorithm 7). Cached per volunteer with 1-hour expiry.

### Final Weighted Score

$$S_{final} = \min\left(1.0, \max\left(0.01, \sum_{c \in C} w_c \cdot S_c\right)\right)$$

Where $C = \{\text{semantic}, \text{distance}, \text{skill}, \text{availability}, \text{trust}\}$, and $w_c$ are strategy-specific weights (see Algorithm 6 — Ranking Strategies).

Converted to a percentage: $\text{recommendation\_score} = \text{round}(S_{final} \times 100, 1)$

### Implementation Details
```php
private function weightedScore(float $semantic, float $distance, float $skill, float $availability, float $trust): float {
    $w = config('workflow.strategies.recommendation.weights');
    return min(1.0, max(0.01,
        ($w['semantic'] * $semantic) +
        ($w['distance'] * $distance) +
        ($w['skill'] * $skill) +
        ($w['availability'] * $availability) +
        ($w['trust'] * $trust)
    ));
}
```

### Time and Space Complexity
- **Time**: $O(|V_{tfidf}| + |T_{tfidf}| + |V_{skills}| + |T_{skills}|)$ per volunteer-task pair
- **Space**: $O(1)$ per pair (beyond the stored vectors)

### Example
**Volunteer**: Semantic=0.7, Distance=0.9, Skill=0.6, Availability=0.9, Trust=0.75
**Default weights**: semantic=0.30, distance=0.20, skill=0.20, availability=0.10, trust=0.20

$$S_{final} = 0.30 \times 0.7 + 0.20 \times 0.9 + 0.20 \times 0.6 + 0.10 \times 0.9 + 0.20 \times 0.75$$
$$= 0.21 + 0.18 + 0.12 + 0.09 + 0.15 = 0.75$$

Recommendation score = 75.0%

---

## 6. Five Ranking Strategies

### Purpose
Provide alternative weight configurations for the recommendation engine, allowing NGOs or admins to prioritize different aspects of matching (trust, skills, distance, availability).

### Where It Is Used
- `Ranker.php` — strategy registry and dispatcher
- `Strategies/RecommendationScoreStrategy.php`, `TrustFirstStrategy.php`, `SkillsFirstStrategy.php`, `DistanceFirstStrategy.php`, `AvailabilityFirstStrategy.php`
- Each implements `RankingStrategyInterface` with `calculateScore(array $scores): float`

### Weight Configurations

| Strategy | $w_{sem}$ | $w_{dist}$ | $w_{skill}$ | $w_{avail}$ | $w_{trust}$ |
|----------|-----------|------------|-------------|-------------|-------------|
| **recommendation** (default) | 0.30 | 0.20 | 0.20 | 0.10 | 0.20 |
| **trust_first** | 0.15 | 0.10 | 0.15 | 0.10 | **0.50** |
| **skills_first** | 0.15 | 0.10 | **0.50** | 0.10 | 0.15 |
| **distance_first** | 0.15 | **0.50** | 0.15 | 0.10 | 0.10 |
| **availability_first** | 0.15 | 0.10 | 0.15 | **0.50** | 0.10 |

### Implementation
```php
// Ranker resolves strategy by name
private static array $strategyMap = [
    'recommendation' => Strategies\RecommendationScoreStrategy::class,
    'trust_first'    => Strategies\TrustFirstStrategy::class,
    'skills_first'   => Strategies\SkillsFirstStrategy::class,
    'distance_first' => Strategies\DistanceFirstStrategy::class,
    'availability_first' => Strategies\AvailabilityFirstStrategy::class,
];
```

Each strategy reads its weights from `config/workflow.php` and computes:

$$S_{strategy} = \min\left(1.0, \max\left(0.01, \sum w_c S_c\right)\right)$$

### Example (trust_first)
With $S_{sem}=0.7, S_{dist}=0.9, S_{skill}=0.6, S_{avail}=0.9, S_{trust}=0.95$:

$$S = 0.15(0.7) + 0.10(0.9) + 0.15(0.6) + 0.10(0.9) + 0.50(0.95)$$
$$= 0.105 + 0.09 + 0.09 + 0.09 + 0.475 = 0.85$$

Under the default strategy, the same volunteer scored 0.75. Under trust_first, 0.85 — a high-trust volunteer gets boosted.

---

## 7. Dynamic Trust Score

### Purpose
Quantifies volunteer reliability and engagement into a single score $[0.05, 1.0]$ using seven weighted components, with penalties for negative behaviors.

### Where It Is Used
- `TrustScoreService.php` — core calculation
- `TrustScoreController.php` — API endpoints
- `TrustScoreHistory` model — tracks score changes
- `RecommendationService::getTrustScore()` — consumed in matching
- Observers and event listeners trigger recalculation

### Component Formulas

#### Attendance Score
$$S_{att} = \frac{\text{completed}}{\max(\text{completed} + \text{absent}, 1)}$$

Defaults to 0.5 if no logs.

#### Completion Score
$$S_{comp} = \max\left(0, \min\left(1, \left(\frac{\text{completed}}{\max(\text{accepted}, 1)}\right) \times 0.7 + \left(1 - \frac{\text{cancelled} + \text{withdrawn}}{\max(\text{total}, 1)}\right) \times 0.3\right)\right)$$

#### Ratings Score (Bayesian Average)
$$\text{bayesian\_avg} = \frac{\sum r + \text{prior\_count} \times \text{prior\_mean} \times 5}{\text{count} + \text{prior\_count} \times 5}$$

$$S_{ratings} = \min\left(1, \frac{\text{bayesian\_avg}}{5}\right)$$

Where $\text{prior\_count} = 3$, $\text{prior\_mean} = 0.7$ (configurable). This pulls ratings toward the prior mean when few ratings exist.

#### Verification Score
$$S_{ver} = \begin{cases}
0.8 & \text{if identity verified with no documents} \\
0.1 & \text{if no documents and not identity verified} \\
1.0 & \text{if } \text{verified} = \text{total} \\
0.3 + 0.7 \times \frac{\text{verified}}{\max(\text{total}, 1)} & \text{otherwise}
\end{cases}$$

#### Response Rate Score
$$S_{resp} = \max\left(0, \min\left(1, \frac{\text{accepted}}{\max(\text{total\_responded}, 1)} \times 0.7 + \left(1 - \frac{\text{withdrawn}}{\max(\text{total\_responded}, 1)}\right) \times 0.3\right)\right)$$

#### Account Activity Score
$$S_{act} = \min\left(1, \frac{\text{recent\_sessions} + \text{recent\_applications}}{\text{threshold}}\right)$$

Defaults to 0.1 if no activity. Lookback = 90 days, threshold = 5.

#### Penalty Score
$$P = \min\left(P_{max}, \sum_{e \in E} n_e \cdot p_e\right)$$

Where:

| Event ($e$) | Penalty per event ($p_e$) |
|------------|--------------------------|
| Cancellation | 0.15 |
| No-show (absent) | 0.20 |
| Withdrawal | 0.10 |
| Late check-in | 0.05 |

### Final Score

$$S_{trust} = \min\left(1.0, \max\left(0.05, \sum_{c \in C, c \neq \text{penalties}} w_c S_c - w_{pen} P\right)\right)$$

### Default Weights

| Component | Weight |
|-----------|--------|
| Attendance | 0.20 |
| Completion | 0.20 |
| Ratings | 0.20 |
| Verification | 0.15 |
| Response Rate | 0.10 |
| Account Activity | 0.05 |
| Penalties | 0.10 (subtracted) |

### Implementation
```php
$finalScore = 0;
foreach ($weights as $key => $weight) {
    if ($key === 'penalties') {
        $finalScore -= $weight * $componentValues[$key];
    } else {
        $finalScore += $weight * $componentValues[$key];
    }
}
$finalScore = round(min($maxScore, max($minScore, $finalScore)), 4);
```

History is tracked in `trust_score_histories` with snapshots.

### Example
**Volunteer**: 5 completed tasks, 1 absence, 3 accepted, 2 cancelled, 1 withdrawn, 4 ratings (5, 4, 4, 5), 2 verified docs out of 3 total, 3 accepted apps out of 5 total decisions, 8 recent activities (threshold=5)

| Component | Raw | Weighted |
|-----------|-----|----------|
| Attendance | $5/6 = 0.8333$ | $0.20 \times 0.8333 = 0.1667$ |
| Completion | $0.7(5/3) + 0.3(1 - 3/6) = \min(1, 1.167) \times 0.7 + 0.3 \times 0.5 = 0.7 + 0.15 = 0.85$ | $0.20 \times 0.85 = 0.17$ |
| Ratings (Bayesian) | $(5+4+4+5 + 3\times0.7\times5) / (4 + 3\times5) = (18 + 10.5) / 19 = 1.5$, normalized $1.5/5 = 0.3$ | $0.20 \times 0.3 = 0.06$ |
| Verification | $0.3 + 0.7(2/3) = 0.7667$ | $0.15 \times 0.7667 = 0.115$ |
| Response Rate | $0.7(3/5) + 0.3(1 - 1/5) = 0.42 + 0.24 = 0.66$ | $0.10 \times 0.66 = 0.066$ |
| Activity | $\min(1, 8/5) = 1.0$ | $0.05 \times 1.0 = 0.05$ |
| Penalties | $2 \times 0.15 + 1 \times 0.20 + 1 \times 0.10 = 0.30 + 0.20 + 0.10 = 0.60$ | $-0.10 \times 0.60 = -0.06$ |

$S_{trust} = 0.1667 + 0.17 + 0.06 + 0.115 + 0.066 + 0.05 - 0.06 = 0.5677$

---

## 8. Identity Verification Confidence Scorer

### Purpose
Computes a weighted confidence score from five identity verification sub-scores and decides the outcome: auto-verify, manual review, or reject.

### Where It Is Used
- `ConfidenceScorer.php` — scoring + decision logic
- `VerificationPipelineService.php` — orchestrates the full pipeline

### Mathematical Formula

$$C = \sum_{i} w_i \cdot s_i$$

Where $s_i \in [0, 100]$ are normalized component scores, and:

| Component ($i$) | Weight ($w_i$) |
|----------------|---------------|
| OCR Accuracy | 0.30 |
| Face Match | 0.30 |
| Liveness | 0.20 |
| Document Quality | 0.10 |
| Data Consistency | 0.10 |

### Decision Thresholds
$$D(C) = \begin{cases}
\text{auto\_verified} & C \geq 95 \\
\text{manual\_review} & 80 \leq C < 95 \\
\text{rejected} & C < 80
\end{cases}$$

### Implementation
```php
public function calculate(array $scores): array {
    $finalScore = 0;
    foreach ($weights as $key => $weight) {
        $finalScore += $weight * $components[$key];
    }
    $finalScore = round(max(0, min(100, $finalScore)), 2);
}

public function decide(float $confidenceScore): array {
    if ($confidenceScore >= 95) return ['decision' => 'auto_verified', ...];
    if ($confidenceScore >= 80) return ['decision' => 'manual_review', ...];
    return ['decision' => 'rejected', ...];
}
```

### Example
OCR=90, FaceMatch=85, Liveness=70, DocQuality=80, Consistency=95

$$C = 0.30(90) + 0.30(85) + 0.20(70) + 0.10(80) + 0.10(95)$$
$$= 27 + 25.5 + 14 + 8 + 9.5 = 84.0\%$$

**Decision**: Manual review ($80 \leq 84 < 95$).

---

## 9. Additional Algorithms

### 9a. Document Quality Scoring
**File**: `DocumentValidator.php`

Heuristic scoring based on image dimensions and file size:

$$\text{Quality} = 0.5 \times D_{score} + 0.5 \times S_{score}$$

Where $D_{score}$ increases with resolution (30→60→80→100) and $S_{score}$ increases with file size (30→50→80→100).

### 9b. Face Matching (Dummy Provider)
**File**: `DummyFaceMatchingProvider.php`

Compares MD5 hashes of document and selfie images using Levenshtein distance:

$$\text{similarity} = \left(1 - \frac{\text{levenshtein}(\text{MD5}_{doc}, \text{MD5}_{selfie})}{\max(\text{len}_{doc}, \text{len}_{selfie})}\right) \times 100$$

### 9c. Liveness Detection (Dummy Provider)
**File**: `DummyLivenessDetectionProvider.php`

Assesses liveness based on image quality heuristics (dimensions and file size). Pure quality-based estimate combining dimension score, size score, and aspect ratio.

### 9d. Data Consistency Checking
**File**: `DataConsistencyService.php`

Compares OCR-extracted fields against volunteer profile:
- **Name**: Levenshtein similarity $> 60\%$ → match
- **DOB**: Substring match
- **Gender**: Case-insensitive exact match
- **Address**: Substring containment match

Weighted: name (40%), DOB (30%), gender (15%), address (15%).

$$\text{Consistency} = \frac{\text{passed\_weight}}{\text{total\_weight}} \times 100$$

### 9e. Attendance Confidence Scoring
**File**: `AttendanceConfidenceService.php`

$$C_{att} = 0.30 \times QR_{score} + 0.35 \times GPS_{score} + 0.25 \times Time_{score} + 0.10 \times Device_{score}$$

Levels: $\geq 85$ = high, $\geq 65$ = medium, $\geq 40$ = low, $< 40$ = manual_review.

### 9f. GPS Validation
**File**: `GpsValidationService.php`

Validates that volunteer's GPS coordinates are within 500m of the task location and accuracy is $\leq 50$m. Scores penalize: accuracy $> 50$m loses 30 points; distance $> 500$m loses 100 points.

### 9g. QR Code Generation/Validation
**File**: `QrCodeService.php`

Token: 64-char random string. Signature: HMAC-SHA256 of `token:taskId:timestamp` using the app key. Expiry: 15 minutes. Validation checks: existence, active, not expired, signature match, task active.

### 9h. Time Window Validation
**File**: `TimeValidationService.php`

Check-in validated against a $\pm 15$ minute window from task start. Score decays linearly from 100 at window start to 60 at window end. Check-out requires $\geq 1$ minute elapsed.

### 9i. Certificate Hashing
**File**: `CertificateHashService.php`

$$H = \text{SHA-256}(\text{cert\_number} \mid \text{vol\_id} \mid \text{task\_id} \mid \text{ngo\_id} \mid \text{vol\_name} \mid \text{task\_title} \mid \text{hours} \mid \text{issue\_date})$$

Prepending: `CERTHASH_{PREFIX}_{HASH}` where prefix is first 8 hex chars of SHA-256 of the certificate number.

### 9j. Time Overlap Detection
**File**: `TimeOverlapService.php`

$$\text{overlap\_ratio} = \frac{\max(0, \min(A_{end}, B_{end}) - \max(A_{start}, B_{start}))}{\max(A_{duration}, B_{duration})}$$

Conflict types by ratio: $\geq 0.25$ minor, $\geq 0.50$ partial, $\geq 0.75$ major, $= 1.0$ complete.

### 9k. Travel Time Estimation
**File**: `TravelTimeService.php`

$$\text{minutes} = \left\lceil \frac{\text{haversine\_km}}{\text{speed\_kmh}} \times 60 \right\rceil$$

Default speed: 30 km/h. Uses the same haversine formula.

### 9l. Assignment Service (Hungarian Wrapper)
**File**: `AssignmentService.php`

Builds cost matrix where $\text{cost} = 1 - \text{match\_score}$, pads to square, invokes `HungarianMatcher::solve()`, then updates matched applications to "Accepted" status in a database transaction.

### 9m. OCR (Tesseract) with Confidence Estimation
**File**: `TesseractOcrProvider.php`

Shells out to `tesseract` CLI. Confidence is estimated heuristically:

$$C_{ocr} = \min\left(100, \left(\frac{\text{alpha\_numeric\_chars}}{\text{total\_chars}} \times 0.7 + \min\left(1, \frac{\text{line\_count}}{10}\right) \times 0.3\right) \times 100\right)$$

### 9n. Structured OCR Parsing
**File**: `StructuredOcrParser.php`

Applies document-type-specific regex patterns to extract structured fields (name, document number, DOB, gender, address) from raw OCR text. Supports citizenship, national ID, student ID, and passport formats.