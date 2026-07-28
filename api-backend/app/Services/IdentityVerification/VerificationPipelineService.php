<?php

namespace App\Services\IdentityVerification;

use App\Models\IdentityVerification\IdentityDocument;
use App\Models\IdentityVerification\IdentityVerification;
use App\Models\IdentityVerification\IdentityVerificationLog;
use App\Models\VolunteerProfile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class VerificationPipelineService
{
    public function __construct(
        private OcrService $ocrService,
        private ImageQualityAssessmentService $imageQualityService,
        private DocumentStructureValidationService $documentStructureService,
        private DataConsistencyService $dataConsistencyService,
        private RiskScoringService $riskScoringService,
    ) {}

    public function startVerification(VolunteerProfile $profile): IdentityVerification
    {
        $existing = IdentityVerification::where('verifiable_id', $profile->id)
            ->where('verifiable_type', VolunteerProfile::class)
            ->whereIn('status', ['pending', 'processing'])
            ->first();

        if ($existing) {
            return $existing;
        }

        $verification = IdentityVerification::create([
            'verifiable_id' => $profile->id,
            'verifiable_type' => VolunteerProfile::class,
            'status' => 'pending',
            'started_at' => now(),
        ]);

        $this->logStep($verification, 'verification_started', 'success', 'Identity verification initiated');

        return $verification;
    }

    public function uploadDocument(
        IdentityVerification $verification,
        UploadedFile $file,
        string $documentType
    ): IdentityDocument {
        $path = $file->store(
            config('identity-verification.storage.documents_path', 'identity-verification/documents'),
            config('identity-verification.storage.documents_disk', 'public')
        );

        $document = IdentityDocument::create([
            'identity_verification_id' => $verification->id,
            'document_type' => $documentType,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'ocr_status' => 'pending',
            'validation_status' => 'pending',
        ]);

        $this->logStep($verification, 'document_upload', 'success', "Document uploaded: {$documentType}", [
            'document_id' => $document->id,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return $document;
    }

    public function process(IdentityVerification $verification): IdentityVerification
    {
        $verification->update(['status' => 'processing']);
        $this->logStep($verification, 'processing_started', 'success', 'Verification processing started');

        try {
            $documents = $verification->documents;

            if ($documents->isEmpty()) {
                throw new \RuntimeException('No documents uploaded for verification');
            }

            $document = $documents->first();
            $profile = $verification->verifiable;

            $ocrResult = $this->processOcr($verification, $document);
            $imageQualityResult = $this->processImageQuality($verification, $document);
            $documentStructureResult = $this->processDocumentStructure($verification, $document, $ocrResult);
            $consistencyResult = $this->processDataConsistency($verification, $ocrResult, $profile);

            $scored = $this->riskScoringService->calculate([
                'ocr_accuracy' => $ocrResult['ocr_confidence'] ?? 0,
                'image_quality' => $imageQualityResult['quality_score'] ?? 0,
                'document_structure' => $documentStructureResult['structure_score'] ?? 0,
                'data_consistency' => $consistencyResult['consistency_score'] ?? 0,
            ]);

            $decision = $this->riskScoringService->decide($scored['confidence_score']);

            $verification->update([
                'status' => $decision['decision'] === 'auto_verified' ? 'verified' : 'pending_review',
                'confidence_score' => $scored['confidence_score'],
                'ocr_score' => $scored['components']['ocr_accuracy'],
                'document_quality_score' => round(
                    $scored['components']['image_quality'] * 0.55 +
                    $scored['components']['document_structure'] * 0.45,
                    2
                ),
                'data_consistency_score' => $scored['components']['data_consistency'],
                'decision' => $decision['decision'],
                'decision_reason' => $decision['reason'],
                'completed_at' => $decision['decision'] === 'auto_verified' ? now() : null,
            ]);

            $this->logStep($verification, 'verification_completed', 'success', $decision['reason'], [
                'confidence_score' => $scored['confidence_score'],
                'decision' => $decision['decision'],
            ]);

            if ($decision['decision'] === 'auto_verified') {
                $this->applyAutoVerified($verification);
            }
        } catch (\Throwable $e) {
            $verification->update(['status' => 'failed']);
            $this->logStep($verification, 'verification_failed', 'error', $e->getMessage());
            Log::error('Identity verification processing failed', [
                'verification_id' => $verification->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        return $verification->fresh();
    }

    public function approve(IdentityVerification $verification, int $reviewedBy, ?string $remarks = null): IdentityVerification
    {
        $verification->update([
            'status' => 'verified',
            'reviewed_by' => $reviewedBy,
            'reviewed_at' => now(),
            'completed_at' => now(),
            'decision' => 'admin_approved',
            'decision_reason' => $remarks ? "Admin approved: {$remarks}" : 'Admin approved',
        ]);

        $this->applyAutoVerified($verification);
        $this->logStep($verification, 'admin_approved', 'success', $remarks ?? 'Admin approved verification');

        return $verification->fresh();
    }

    public function reject(IdentityVerification $verification, int $reviewedBy, ?string $remarks = null): IdentityVerification
    {
        $verification->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewedBy,
            'reviewed_at' => now(),
            'completed_at' => now(),
            'decision' => 'admin_rejected',
            'decision_reason' => $remarks ? "Admin rejected: {$remarks}" : 'Admin rejected',
        ]);

        $this->logStep($verification, 'admin_rejected', 'success', $remarks ?? 'Admin rejected verification');

        return $verification->fresh();
    }

    private function processOcr(IdentityVerification $verification, IdentityDocument $document): array
    {
        $this->logStep($verification, 'ocr_processing', 'processing', 'Starting OCR processing');

        $result = $this->ocrService->process($document->file_path, $document->document_type);

        $document->update([
            'ocr_extracted_data' => $result['extracted_data'],
            'ocr_confidence' => $result['ocr_confidence'],
            'ocr_status' => 'completed',
        ]);

        $this->logStep($verification, 'ocr_processing', 'success', "OCR completed with confidence {$result['ocr_confidence']}%", [
            'confidence' => $result['ocr_confidence'],
            'extracted_fields' => array_keys(array_filter($result['extracted_data'] ?? [])),
        ]);

        return $result;
    }

    private function processImageQuality(
        IdentityVerification $verification,
        IdentityDocument $document
    ): array {
        $this->logStep($verification, 'image_quality', 'processing', 'Assessing image quality');

        $qualityResult = $this->imageQualityService->assess($document->file_path);

        $document->update([
            'validation_results' => $qualityResult,
            'validation_status' => $qualityResult['score'] >= 40 ? 'passed' : 'failed',
        ]);

        $this->logStep($verification, 'image_quality', 'success', "Image quality score: {$qualityResult['score']}%", $qualityResult);

        return [
            'quality_score' => $qualityResult['score'],
            'details' => $qualityResult,
        ];
    }

    private function processDocumentStructure(
        IdentityVerification $verification,
        IdentityDocument $document,
        array $ocrResult
    ): array {
        $this->logStep($verification, 'document_structure', 'processing', 'Validating document structure');

        $structureResult = $this->documentStructureService->validate(
            $ocrResult['extracted_data'] ?? [],
            $document->document_type
        );

        $this->logStep($verification, 'document_structure', 'success', "Document structure score: {$structureResult['score']}%", $structureResult);

        return [
            'structure_score' => $structureResult['score'],
            'details' => $structureResult,
        ];
    }

    private function processDataConsistency(
        IdentityVerification $verification,
        array $ocrResult,
        $profile
    ): array {
        $this->logStep($verification, 'data_consistency', 'processing', 'Checking data consistency');

        $result = $this->dataConsistencyService->check($ocrResult['extracted_data'] ?? [], $profile);

        $this->logStep($verification, 'data_consistency', 'success', "Data consistency score: {$result['consistency_score']}%", $result);

        return $result;
    }

    private function applyAutoVerified(IdentityVerification $verification): void
    {
        $profile = $verification->verifiable;

        if ($profile && $profile instanceof VolunteerProfile) {
            $profile->updateQuietly([
                'trust_score' => min(1.0, ($profile->trust_score ?? 0.5) + 0.05),
                'trust_updated_at' => now(),
            ]);
        }
    }

    private function logStep(
        IdentityVerification $verification,
        string $step,
        string $status,
        ?string $message = null,
        ?array $payload = null
    ): void {
        IdentityVerificationLog::create([
            'identity_verification_id' => $verification->id,
            'step' => $step,
            'status' => $status,
            'message' => $message,
            'payload' => $payload,
        ]);
    }
}
