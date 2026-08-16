<?php

return [

    'default_strategy' => env('WORKFLOW_RANKING_STRATEGY', 'recommendation'),

    'ngo_recommendation_limit' => (int) env('WORKFLOW_NGO_RECOMMENDATION_LIMIT', 10),

    /*
    |--------------------------------------------------------------------------
    | Scoring strategy
    |--------------------------------------------------------------------------
    |
    | WSM (Weighted Sum Model) is the only supported scoring strategy. It is
    | the canonical input for the MCMF optimisation stage and the priority
    | score used across the recommendation workflow. Legacy strategy values
    | accepted by the API are ignored and always resolved to WSM.
    |
    */
    'strategies' => [
        'recommendation' => [
            'label' => 'Recommendation Score',
            'weights' => ['semantic' => 0.30, 'distance' => 0.20, 'skill' => 0.20, 'availability' => 0.10, 'trust' => 0.20],
        ],
    ],
];