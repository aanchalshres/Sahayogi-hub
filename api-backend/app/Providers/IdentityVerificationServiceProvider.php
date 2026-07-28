<?php

namespace App\Providers;

use App\Algorithms\IdentityVerification\Contracts\DocumentValidatorInterface;
use App\Algorithms\IdentityVerification\Contracts\OcrProviderInterface;
use App\Algorithms\IdentityVerification\DocumentValidation\DocumentValidator;
use App\Algorithms\IdentityVerification\Ocr\StructuredOcrParser;
use App\Algorithms\IdentityVerification\Ocr\TesseractOcrProvider;
use App\Services\IdentityVerification\VerificationPipelineService;
use Illuminate\Support\ServiceProvider;

class IdentityVerificationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(OcrProviderInterface::class, function () {
            $provider = config('identity-verification.ocr.provider', 'tesseract');

            return match ($provider) {
                'tesseract' => new TesseractOcrProvider(),
                default => new TesseractOcrProvider(),
            };
        });

        $this->app->bind(DocumentValidatorInterface::class, DocumentValidator::class);

        $this->app->singleton(StructuredOcrParser::class);
        $this->app->singleton(VerificationPipelineService::class);
    }

    public function boot(): void
    {
        //
    }
}
