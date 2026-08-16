<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Algorithms\Contracts\SimilarityCalculatorInterface;

use App\Algorithms\Matching\CosineSimilarity;

class AlgorithmServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            SimilarityCalculatorInterface::class,
            CosineSimilarity::class
        );
    }

    public function boot(): void
    {
        //
    }
}
