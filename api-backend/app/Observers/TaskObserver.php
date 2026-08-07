<?php

namespace App\Observers;

use App\Models\Task;
use App\Services\TfIdfGenerationService;

class TaskObserver
{
    public function __construct(
        private TfIdfGenerationService $tfidf,
    ) {}

    /**
     * Generate a TF-IDF vector immediately when a new task is created.
     * (saved() + wasChanged() only fires on updates, not on creation)
     */
    public function created(Task $task): void
    {
        $task->loadMissing(['skills', 'category']);
        $this->tfidf->generateForTask($task);
    }

    /**
     * Regenerate the vector when searchable text fields are updated.
     */
    public function saved(Task $task): void
    {
        if ($task->wasChanged(['title', 'description', 'category_id', 'location', 'city', 'country'])) {
            $task->loadMissing(['skills', 'category']);
            $this->tfidf->generateForTask($task);
        }
    }
}
