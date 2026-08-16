<?php

namespace App\Observers;

use App\Models\VolunteerProfile;
use App\Services\TfIdfGenerationService;

class VolunteerProfileObserver
{
    public function __construct(
        private TfIdfGenerationService $tfidf,
    ) {}


    public function created(VolunteerProfile $profile): void
    {
        $profile->loadMissing('skills');
        $this->tfidf->generateForVolunteer($profile);
    }

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

