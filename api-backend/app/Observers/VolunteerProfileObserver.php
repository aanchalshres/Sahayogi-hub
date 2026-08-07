<?php

namespace App\Observers;

use App\Models\VolunteerProfile;
use App\Services\TfIdfGenerationService;

class VolunteerProfileObserver
{
    public function __construct(
        private TfIdfGenerationService $tfidf,
    ) {}

    /**
     * Generate a TF-IDF vector immediately when a new volunteer profile is created.
     * (saved() + wasChanged() returns false on initial insert)
     */
    public function created(VolunteerProfile $profile): void
    {
        $profile->loadMissing('skills');
        $this->tfidf->generateForVolunteer($profile);
    }

    /**
     * Regenerate the vector when searchable text fields change, or
     * if the vector is still missing (e.g. profile pre-dates the observer).
     */
    public function saved(VolunteerProfile $profile): void
    {
        $needsVector = empty($profile->tfidf_vector);
        $textChanged = $profile->wasChanged(['bio', 'primary_location', 'city', 'country']);

        if ($needsVector || $textChanged) {
            $profile->loadMissing('skills');
            $this->tfidf->generateForVolunteer($profile);
        }
    }
}

