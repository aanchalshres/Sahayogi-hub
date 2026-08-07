<?php

namespace App\Services;

use InvalidArgumentException;

/**
 * Minimum-Cost Maximum-Flow (MCMF) optimisation stage.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THIS CLASS DOES
 * ─────────────────────────────────────────────────────────────────────────────
 * The recommendation pipeline produces a WSM suitability score (0–100) for
 * every (volunteer, task) pair. Picking the "top volunteer for each task"
 * independently is greedy and can produce globally sub-optimal results:
 * two tasks may both want the same high-scoring volunteer, while a second,
 * still-good volunteer sits idle.
 *
 * MCMF solves this as a network-flow problem. We build a directed graph:
 *
 *         Source ──(cap 1)──> Volunteer ──(cap 1, cost)──> Task ──(cap = required_volunteers)──> Sink
 *
 * and route the maximum possible number of volunteers into tasks along the
 * cheapest (lowest-cost) paths. Because volunteer→task edges are built from
 * the WSM score (cost = 100 − score), minimising total cost is equivalent to
 * maximising total WSM suitability while respecting:
 *    • every volunteer is recommended to at most ONE task  (source cap = 1)
 *    • every task receives at most `required_volunteers` (task→sink cap)
 *
 * The result is a global, capacity-aware optimisation — the final stage of
 * the recommendation workflow. This service ONLY produces recommendations;
 * it never writes assignments. The NGO reviews and approves the list.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE ALGORITHM: SUCCESSIVE SHORTEST PATHS (SSP) with SPFA
 * ─────────────────────────────────────────────────────────────────────────────
 * The classic polynomial-time MCMF algorithm is "Successive Shortest Paths":
 *
 *   1. Start with zero flow on every edge (the residual network = original).
 *   2. Find the SHORTEST (cheapest) path from source → sink in the residual
 *      network, where "distance" of an edge is its cost.
 *   3. Push as much flow as possible along that path (the bottleneck edge).
 *   4. Subtract the flow from forward edges and add it to the reverse
 *      ("residual") edges; reverse edges get NEGATIVE cost so flow can be
 *      "undone" if a later augmentation finds a better route.
 *   5. Repeat 2–4 until no path from source to sink remains.
 *
 *   The maximum-flow property guarantees every achievable volunteer is used;
 *   the shortest-path property guarantees the accumulated cost is minimal
 *   (this is the well-known result that augmenting along shortest paths in
 *   a residual network yields a minimum-cost flow).
 *
 * For step 2 we use SPFA (Shortest Path Faster Algorithm) — a queue-based
 * Bellman–Ford variant. Bellman–Ford is required here (not Dijkstra) because
 * residual reverse edges carry negative costs, and Dijkstra cannot handle
 * negative edges without reweighting.
 *
 *   Complexity:  O(F · V · E) worst case,  F = total flow pushed,
 *                V = nodes, E = edges. In practice SPFA is much faster.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
class MinCostMaxFlowService
{
    /**
     * An edge in the residual network.
     *
     * @var array{to:int, rev:int, cap:int, cost:float}
     *
     * to   : the node this edge points to
     * rev  : index of the paired reverse edge inside $graph[$to]
     * cap  : remaining capacity (residual). When flow is pushed, forward
     *        cap decreases and reverse cap increases by the same amount.
     * cost : cost per unit of flow. Reverse edges store the negated cost.
     */
    private array $graph = [];

    /** Shortest-path distances from the source in the current residual graph. */
    private array $dist = [];

    /** predecessor node for each node along the last SPFA path. */
    private array $prevNode = [];

    /** index of the edge (inside $graph[$prevNode]) used to reach each node. */
    private array $prevEdge = [];

    /** SPFA bookkeeping: is node currently in the relaxation queue? */
    private array $inQueue = [];

    /**
     * Run the full MCMF optimisation.
     *
     * @param array $volunteers List of volunteers. Each entry may be an
     *                          array with `id`, `name`, `availability` keys,
     *                          or an Eloquent model exposing those attributes
     *                          (e.g. VolunteerProfile).
     * @param array $tasks      List of tasks. Each entry may be an array with
     *                          `id`, `title`, `required_volunteers` keys, or
     *                          an Eloquent Task model.
     * @param array $scores     WSM suitability matrix, keyed by ids:
     *                          [ volunteerId => [ taskId => score ] ]
     *                          Scores are 0–100 (0 = no fit, 100 = perfect).
     *                          Pairs with no entry produce NO edge — the
     *                          volunteer is never recommended to that task.
     * @param array $options    Optional tuning:
     *                          - 'availability_filter' (array of strings):
     *                            only volunteers whose `availability` value is
     *                            inside this list enter the graph. Default:
     *                            all volunteers are eligible.
     *                          - 'max_recommendations' (int): hard cap on the
     *                            total number of volunteer→task pairs pushed.
     *                            Default: unlimited (push the maximum flow).
     *
     * @return array{
     *     total_flow: int,
     *     total_cost: float,
     *     total_wsm_score: float,
     *     assignments: array<int, array{
     *         task_id: int,
     *         task_title: string,
     *         capacity: int,
     *         filled: int,
     *         volunteers: array<int, array{
     *             volunteer_id: int,
     *             name: string,
     *             wsm_score: float,
     *             edge_cost: float,
     *             rank: int
     *         }>
     *     }>,
     *     unassigned_volunteers: array<int, array{volunteer_id:int, name:string}>
     * }
     */
    public function optimize(
        array $volunteers,
        array $tasks,
        array $scores,
        array $options = []
    ): array {
        $availabilityFilter = $options['availability_filter'] ?? null;
        $maxFlow            = $options['max_recommendations'] ?? PHP_INT_MAX;

        // Map the semantic volunteer/task ids onto dense integer indices so
        // the graph can use plain array nodes. Source = 0, volunteers first,
        // then tasks, then sink = last.
        $volunteerIds = array_values(array_unique(array_map(
            fn ($v) => $this->nodeKey($v, 'id'),
            $volunteers
        )));
        $taskIds = array_values(array_unique(array_map(
            fn ($t) => $this->nodeKey($t, 'id'),
            $tasks
        )));

        $volunteerNode = [];
        foreach ($volunteerIds as $i => $id) {
            $volunteerNode[$id] = 1 + $i;
        }
        $taskNode = [];
        foreach ($taskIds as $j => $id) {
            $taskNode[$id] = 1 + count($volunteerIds) + $j;
        }

        $source = 0;
        $sink   = 1 + count($volunteerIds) + count($taskIds);

        // Build the graph: reset the residual network to zero flow.
        $this->graph = [];
        for ($node = 0; $node <= $sink; $node++) {
            $this->graph[$node] = [];
        }

        $volunteerMeta = [];
        foreach ($volunteers as $volunteer) {
            $id = $this->nodeKey($volunteer, 'id');
            if (!isset($volunteerNode[$id])) {
                continue;
            }

            $availability = $this->nodeValue($volunteer, 'availability');
            $eligible = $availabilityFilter === null
                || in_array($availability, $availabilityFilter, true);

            $volunteerMeta[$id] = [
                'name' => $this->nodeValue($volunteer, 'name') ?? "Volunteer #{$id}",
                'availability' => $availability,
            ];

            if (!$eligible) {
                continue; // unavailable volunteers get no edge from source
            }

            // Source → Volunteer, capacity 1: a volunteer can be recommended
            // to at most one task.
            $this->addEdge($source, $volunteerNode[$id], 1, 0.0);
        }

        foreach ($tasks as $task) {
            $id = $this->nodeKey($task, 'id');
            if (!isset($taskNode[$id])) {
                continue;
            }

            $capacity = max(1, (int) ($this->nodeValue($task, 'required_volunteers') ?? 1));

            // Task → Sink, capacity = required_volunteers: the task can
            // accept up to its required number of volunteers.
            $this->addEdge($taskNode[$id], $sink, $capacity, 0.0);
        }

        // Volunteer → Task edges carry the converted WSM cost.
        foreach ($volunteers as $volunteer) {
            $vId = $this->nodeKey($volunteer, 'id');
            if (!isset($volunteerNode[$vId])) {
                continue;
            }

            foreach ($tasks as $task) {
                $tId = $this->nodeKey($task, 'id');
                if (!isset($taskNode[$tId])) {
                    continue;
                }

                $score = $scores[$vId][$tId] ?? null;
                if ($score === null || $score <= 0) {
                    continue; // no suitability → no edge in the graph
                }

                $score = max(0.0, min(100.0, (float) $score));

                // cost = 100 − WSM_score: the better the match, the cheaper
                // the edge, so the solver prefers high-suitability pairs.
                $cost = round(100.0 - $score, 4);

                $this->addEdge($volunteerNode[$vId], $taskNode[$tId], 1, $cost);
            }
        }

        // ── Successive Shortest Paths: keep pushing flow until either the
        //    sink is unreachable or the optional cap is reached. ──────────
        $totalFlow = 0;
        $totalCost = 0.0;

        while ($totalFlow < $maxFlow && $this->spfa($source, $sink)) {
            // 1. Trace the found path back from sink to source.
            $path = [];
            for ($node = $sink; $node !== $source; $node = $this->prevNode[$node]) {
                $path[] = $node;
            }
            $path = array_reverse($path);

            // 2. The bottleneck is the smallest residual capacity on the path
            //    (edges here all have capacity ≥ 1, but keep it general).
            $bottleneck = PHP_INT_MAX;
            $node = $source;
            foreach ($path as $next) {
                $edge = $this->graph[$node][$this->prevEdge[$next]];
                $bottleneck = min($bottleneck, $edge['cap']);
                $node = $next;
            }

            // 3. Push flow: subtract from forward edges, add to reverse
            //    (residual) edges so the flow can be cancelled later.
            $pathCost = 0.0;
            $node = $source;
            foreach ($path as $next) {
                $edge = &$this->graph[$node][$this->prevEdge[$next]];
                $pathCost += $edge['cost'] * $bottleneck;

                $edge['cap'] -= $bottleneck;
                $this->graph[$next][$edge['rev']]['cap'] += $bottleneck;

                $node = $next;
            }
            unset($edge); // break the reference so later foreach reuse is safe

            $totalFlow += $bottleneck;
            $totalCost += $pathCost; // shortest path ⇒ cheapest augmentation
        }

        return $this->formatResult(
            $volunteers,
            $tasks,
            $volunteerIds,
            $taskIds,
            $volunteerNode,
            $taskNode,
            $volunteerMeta,
            $totalFlow,
            $totalCost
        );
    }

    /**
     * SPFA: find the minimum-cost path from $source to $sink in the current
     * residual network. Returns false when the sink is unreachable.
     *
     * SPFA is Bellman–Ford with a queue: a node is re-examined only when one
     * of its incoming edges was successfully relaxed, which avoids scanning
     * the whole graph on every iteration.
     *
     * @return bool true if a path exists (results stored in $dist/$prevNode/$prevEdge)
     */
    private function spfa(int $source, int $sink): bool
    {
        $nodeCount = count($this->graph);

        $this->dist    = array_fill(0, $nodeCount, INF);
        $this->prevNode = array_fill(0, $nodeCount, -1);
        $this->prevEdge = array_fill(0, $nodeCount, -1);
        $this->inQueue = array_fill(0, $nodeCount, false);

        $this->dist[$source] = 0.0;

        $queue = new \SplQueue();
        $queue->enqueue($source);
        $this->inQueue[$source] = true;

        while (!$queue->isEmpty()) {
            $u = $queue->dequeue();
            $this->inQueue[$u] = false;

            // Relax every outgoing edge of $u that still has capacity.
            foreach ($this->graph[$u] as $edgeIndex => $edge) {
                if ($edge['cap'] <= 0) {
                    continue;
                }

                $v = $edge['to'];
                $candidate = $this->dist[$u] + $edge['cost'];

                if ($candidate < $this->dist[$v]) {
                    $this->dist[$v]    = $candidate;
                    $this->prevNode[$v] = $u;
                    $this->prevEdge[$v] = $edgeIndex;

                    if (!$this->inQueue[$v]) {
                        $queue->enqueue($v);
                        $this->inQueue[$v] = true;
                    }
                }
            }
        }

        return $this->dist[$sink] < INF;
    }

    /**
     * Add a directed edge (and its paired reverse edge) to the residual
     * network. Every forward edge gets a reverse edge with capacity 0 and
     * NEGATIVE cost — this is what allows the algorithm to reroute flow and
     * thereby reach the global optimum.
     */
    private function addEdge(int $from, int $to, int $cap, float $cost): void
    {
        $forward = ['to' => $to, 'rev' => count($this->graph[$to]), 'cap' => $cap, 'cost' => $cost];
        $reverse = ['to' => $from, 'rev' => count($this->graph[$from]), 'cap' => 0, 'cost' => -$cost];

        $this->graph[$from][] = $forward;
        $this->graph[$to][]   = $reverse;
    }

    /**
     * Convert the raw flow solution into the per-task recommendation list.
     *
     * A volunteer is "assigned" exactly when the volunteer→task edge carries
     * flow, which is detectable by the reverse edge holding 1 unit (the
     * forward edge is consumed by the augmentation).
     */
    private function formatResult(
        array $volunteers,
        array $tasks,
        array $volunteerIds,
        array $taskIds,
        array $volunteerNode,
        array $taskNode,
        array $volunteerMeta,
        int $totalFlow,
        float $totalCost
    ): array {
        // volunteerId => [ taskId => wsmScore ] derived from residual caps.
        $pairs = [];
        $totalWsm = 0.0;

        foreach ($volunteerIds as $vId) {
            $node = $volunteerNode[$vId];
            foreach ($this->graph[$node] as $edge) {
                $taskId = null;
                foreach ($taskIds as $tId) {
                    if ($taskNode[$tId] === $edge['to']) {
                        $taskId = $tId;
                        break;
                    }
                }
                if ($taskId === null || $edge['cap'] !== 0) {
                    continue;
                }

                // The edge has zero residual capacity ⇒ one unit of flow was
                // pushed through it: this volunteer is recommended to this task.
                // Its reverse edge carries the original cost we paid.
                $cost = -$this->graph[$edge['to']][$edge['rev']]['cost'];
                $score = round(100.0 - $cost, 4);

                $pairs[$taskId][] = [
                    'volunteer_id' => $vId,
                    'name' => $volunteerMeta[$vId]['name'],
                    'wsm_score' => $score,
                    'edge_cost' => round($cost, 4),
                ];
                $totalWsm += $score;
            }
        }

        // Group the pairs into the per-task output shape, ranked best-first.
        $assignments = [];
        foreach ($tasks as $task) {
            $taskId = $this->nodeKey($task, 'id');
            if (!isset($pairs[$taskId])) {
                continue;
            }

            usort($pairs[$taskId], fn ($a, $b) => $b['wsm_score'] <=> $a['wsm_score']);

            foreach ($pairs[$taskId] as $index => &$pair) {
                $pair['rank'] = $index + 1;
            }
            unset($pair);

            $assignments[] = [
                'task_id'    => $taskId,
                'task_title' => (string) ($this->nodeValue($task, 'title') ?? "Task #{$taskId}"),
                'capacity'   => max(1, (int) ($this->nodeValue($task, 'required_volunteers') ?? 1)),
                'filled'     => count($pairs[$taskId]),
                'volunteers' => $pairs[$taskId],
            ];
        }

        // Volunteers that received no recommendation at all.
        $assigned = [];
        foreach ($pairs as $taskPairs) {
            foreach ($taskPairs as $pair) {
                $assigned[$pair['volunteer_id']] = true;
            }
        }

        $unassigned = [];
        foreach ($volunteers as $volunteer) {
            $id = $this->nodeKey($volunteer, 'id');
            if (!isset($volunteerNode[$id]) || isset($assigned[$id])) {
                continue;
            }
            if (isset($volunteerMeta[$id])) {
                $unassigned[] = [
                    'volunteer_id' => $id,
                    'name' => $volunteerMeta[$id]['name'],
                ];
            }
        }

        return [
            'total_flow'           => $totalFlow,
            'total_cost'           => round($totalCost, 4),
            'total_wsm_score'      => round($totalWsm, 2),
            'assignments'          => $assignments,
            'unassigned_volunteers'=> $unassigned,
        ];
    }

    /**
     * Read an attribute from an Eloquent model or a plain array.
     */
    private function nodeValue(mixed $entity, string $key): mixed
    {
        if (is_array($entity)) {
            return $entity[$key] ?? null;
        }

        return $entity->{$key} ?? null;
    }

    /**
     * Resolve the node id, throwing a clear error when it is missing.
     */
    private function nodeKey(mixed $entity, string $key): int
    {
        $value = $this->nodeValue($entity, $key);

        if ($value === null) {
            throw new InvalidArgumentException(
                'Every volunteer/task must expose an `id` attribute to run MCMF.'
            );
        }

        return (int) $value;
    }
}
