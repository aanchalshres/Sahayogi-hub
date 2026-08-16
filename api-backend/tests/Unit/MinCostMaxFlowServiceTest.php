<?php

use App\Services\MinCostMaxFlowService;

function volunteer(int $id, string $name, string $availability = 'Available'): array
{
    return ['id' => $id, 'name' => $name, 'availability' => $availability];
}

function task(int $id, string $title, int $requiredVolunteers): array
{
    return ['id' => $id, 'title' => $title, 'required_volunteers' => $requiredVolunteers];
}

it('recommends the best volunteer when capacity is one', function () {
    $service = new MinCostMaxFlowService();

    $result = $service->optimize(
        [volunteer(1, 'Alice'), volunteer(2, 'Bob')],
        [task(10, 'Food Drive', 1)],
        [
            1 => [10 => 90.0],
            2 => [10 => 60.0],
        ]
    );

    expect($result['total_flow'])->toBe(1);
    expect($result['assignments'])->toHaveCount(1);
    expect($result['assignments'][0]['volunteers'])->toHaveCount(1);
    expect($result['assignments'][0]['volunteers'][0]['volunteer_id'])->toBe(1);
    expect($result['assignments'][0]['volunteers'][0]['wsm_score'])->toBe(90.0);
    expect($result['assignments'][0]['volunteers'][0]['edge_cost'])->toBe(10.0);
    expect($result['unassigned_volunteers'])->toHaveCount(1);
});

it('respects task capacity of multiple volunteers', function () {
    $service = new MinCostMaxFlowService();

    $result = $service->optimize(
        [volunteer(1, 'Alice'), volunteer(2, 'Bob'), volunteer(3, 'Carol')],
        [task(10, 'Cleanup Drive', 2)],
        [
            1 => [10 => 95.0],
            2 => [10 => 85.0],
            3 => [10 => 40.0],
        ]
    );

    expect($result['total_flow'])->toBe(2);
    expect($result['assignments'][0]['filled'])->toBe(2);
    expect($result['assignments'][0]['volunteers'])->toHaveCount(2);
    expect($result['assignments'][0]['volunteers'][0]['volunteer_id'])->toBe(1);
    expect($result['assignments'][0]['volunteers'][1]['volunteer_id'])->toBe(2);
});

it('does not exceed a capacity of one volunteer per task when required', function () {
    $service = new MinCostMaxFlowService();

    $result = $service->optimize(
        [volunteer(1, 'Alice'), volunteer(2, 'Bob')],
        [task(10, 'Small Task', 1)],
        [
            1 => [10 => 70.0],
            2 => [10 => 50.0],
        ]
    );

    expect($result['total_flow'])->toBe(1);
    expect($result['assignments'][0]['filled'])->toBe(1);
});

it('globally optimizes across multiple tasks', function () {
    $service = new MinCostMaxFlowService();

    $result = $service->optimize(
        [volunteer(1, 'Alice'), volunteer(2, 'Bob')],
        [task(10, 'Task A', 1), task(20, 'Task B', 1)],
        [
            1 => [10 => 90.0, 20 => 80.0],
            2 => [10 => 85.0, 20 => 40.0],
        ]
    );

    // Both volunteers cannot fit Task A (capacity 1). The two feasible
    // perfect matchings are:
    //   Alice→A(90) + Bob→B(40) = 130
    //   Alice→B(80) + Bob→A(85) = 165  ← the global optimum
    // The solver must find the maximum total WSM, not the greedy top pair.
    expect($result['total_flow'])->toBe(2);
    expect($result['total_wsm_score'])->toBe(165.0);

    $byTask = collect($result['assignments'])->keyBy('task_id');
    expect($byTask[10]['volunteers'][0]['volunteer_id'])->toBe(2);
    expect($byTask[20]['volunteers'][0]['volunteer_id'])->toBe(1);
});

it('leaves a volunteer unrecommended when they fit no task', function () {
    $service = new MinCostMaxFlowService();

    $result = $service->optimize(
        [volunteer(1, 'Alice'), volunteer(2, 'Bob')],
        [task(10, 'Medical Camp', 2)],
        [
            1 => [10 => 88.0],
            // Bob has no edge to the task at all.
        ]
    );

    expect($result['total_flow'])->toBe(1);
    expect($result['assignments'][0]['volunteers'][0]['volunteer_id'])->toBe(1);
    expect(collect($result['unassigned_volunteers'])->pluck('volunteer_id'))
        ->toContain(2);
});

it('excludes unavailable volunteers through the availability filter', function () {
    $service = new MinCostMaxFlowService();

    $result = $service->optimize(
        [volunteer(1, 'Alice'), volunteer(2, 'Bob', 'Unavailable')],
        [task(10, 'Food Drive', 2)],
        [
            1 => [10 => 80.0],
            2 => [10 => 95.0],
        ],
        ['availability_filter' => ['Available']]
    );

    expect($result['total_flow'])->toBe(1);
    expect($result['assignments'][0]['volunteers'][0]['volunteer_id'])->toBe(1);
});

it('pushes no flow when no volunteer is eligible', function () {
    $service = new MinCostMaxFlowService();

    $result = $service->optimize(
        [volunteer(1, 'Alice', 'Busy')],
        [task(10, 'Food Drive', 1)],
        [
            1 => [10 => 95.0],
        ],
        ['availability_filter' => ['Available']]
    );

    expect($result['total_flow'])->toBe(0);
    expect($result['assignments'])->toBe([]);
});

it('respects the maximum flow cap', function () {
    $service = new MinCostMaxFlowService();

    $result = $service->optimize(
        [volunteer(1, 'Alice'), volunteer(2, 'Bob')],
        [task(10, 'Task A', 1), task(20, 'Task B', 1)],
        [
            1 => [10 => 90.0, 20 => 70.0],
            2 => [10 => 80.0, 20 => 60.0],
        ],
        ['max_recommendations' => 1]
    );

    expect($result['total_flow'])->toBe(1);
});

it('computes the minimum total cost for the pushed flow', function () {
    $service = new MinCostMaxFlowService();

    $result = $service->optimize(
        [volunteer(1, 'Alice'), volunteer(2, 'Bob')],
        [task(10, 'Task A', 1), task(20, 'Task B', 1)],
        [
            1 => [10 => 90.0, 20 => 80.0],
            2 => [10 => 85.0, 20 => 40.0],
        ]
    );

    // Global optimum: Alice→B (cost 20) + Bob→A (cost 15) = 35 total.
    expect($result['total_cost'])->toBe(35.0);
});

it('ranks volunteers within a task by wsm score', function () {
    $service = new MinCostMaxFlowService();

    $result = $service->optimize(
        [volunteer(1, 'Alice'), volunteer(2, 'Bob'), volunteer(3, 'Carol')],
        [task(10, 'Campaign', 3)],
        [
            1 => [10 => 55.0],
            2 => [10 => 99.0],
            3 => [10 => 77.0],
        ]
    );

    $ids = collect($result['assignments'][0]['volunteers'])->pluck('volunteer_id')->all();
    expect($ids)->toBe([2, 3, 1]);
    expect($result['assignments'][0]['volunteers'][0]['rank'])->toBe(1);
    expect($result['assignments'][0]['volunteers'][2]['rank'])->toBe(3);
});

it('handles empty inputs gracefully', function () {
    $service = new MinCostMaxFlowService();

    $result = $service->optimize([], [], []);

    expect($result['total_flow'])->toBe(0);
    expect($result['assignments'])->toBe([]);
    expect($result['unassigned_volunteers'])->toBe([]);
});

it('accepts Eloquent-style objects as inputs', function () {
    $service = new MinCostMaxFlowService();

    $alice = (object) ['id' => 1, 'name' => 'Alice', 'availability' => 'Available'];
    $task = (object) ['id' => 10, 'title' => 'Drive', 'required_volunteers' => 1];

    $result = $service->optimize([$alice], [$task], [1 => [10 => 92.0]]);

    expect($result['total_flow'])->toBe(1);
    expect($result['assignments'][0]['task_title'])->toBe('Drive');
});