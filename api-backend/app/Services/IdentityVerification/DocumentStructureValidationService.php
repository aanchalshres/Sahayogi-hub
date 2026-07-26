<?php

namespace App\Services\IdentityVerification;

class DocumentStructureValidationService
{
    private array $requiredFields = [
        'citizenship' => ['full_name', 'document_number', 'date_of_birth'],
        'national_id' => ['full_name', 'document_number'],
        'student_id' => ['full_name', 'document_number'],
        'volunteer_card' => ['full_name', 'document_number'],
        'passport' => ['full_name', 'document_number', 'expiry_date'],
    ];

    public function validate(array $ocrData, string $documentType): array
    {
        $checks = [];

        $fieldCheck = $this->checkRequiredFields($ocrData, $documentType);
        $checks['required_fields'] = $fieldCheck;

        $dateCheck = $this->checkDateFormats($ocrData);
        $checks['date_formats'] = $dateCheck;

        $expiryCheck = $this->checkExpiry($ocrData);
        $checks['expiry'] = $expiryCheck;

        $completenessCheck = $this->checkOcrCompleteness($ocrData);
        $checks['ocr_completeness'] = $completenessCheck;

        $totalWeight = 0;
        $passedWeight = 0;

        $totalWeight += 0.35;
        if ($fieldCheck['valid']) {
            $passedWeight += 0.35;
        }

        $totalWeight += 0.15;
        if ($dateCheck['valid']) {
            $passedWeight += 0.15;
        }

        $totalWeight += 0.25;
        if ($expiryCheck['valid']) {
            $passedWeight += 0.25;
        }

        $totalWeight += 0.25;
        $passedWeight += 0.25 * ($completenessCheck['score'] / 100);

        $overallScore = $totalWeight > 0 ? ($passedWeight / $totalWeight) * 100 : 0;
        $overallScore = round(max(0, min(100, $overallScore)), 2);

        return [
            'score' => $overallScore,
            'checks' => $checks,
        ];
    }

    private function checkRequiredFields(array $ocrData, string $documentType): array
    {
        $fields = $this->requiredFields[$documentType] ?? $this->requiredFields['citizenship'];
        $missing = [];
        $present = [];

        foreach ($fields as $field) {
            $value = $ocrData[$field] ?? null;
            if ($value === null || trim((string) $value) === '') {
                $missing[] = $field;
            } else {
                $present[] = $field;
            }
        }

        $total = count($fields);
        $found = count($present);
        $completeness = $total > 0 ? ($found / $total) * 100 : 0;

        return [
            'valid' => empty($missing),
            'present' => $present,
            'missing' => $missing,
            'completeness' => round($completeness, 2),
        ];
    }

    private function checkDateFormats(array $ocrData): array
    {
        $dateFields = ['date_of_birth', 'expiry_date'];
        $issues = [];

        foreach ($dateFields as $field) {
            $value = $ocrData[$field] ?? null;
            if ($value === null || trim((string) $value) === '') {
                continue;
            }

            $cleaned = preg_replace('/[^0-9\-\.\/]/', '', $value);
            $formats = ['Y-m-d', 'Y/m/d', 'Y.m.d', 'd-m-Y', 'd/m/Y', 'd.m.Y', 'm-d-Y', 'm/d/Y'];

            $parsed = false;
            foreach ($formats as $format) {
                $dt = \DateTime::createFromFormat($format, $cleaned);
                if ($dt && $dt->format($format) === $cleaned) {
                    $parsed = true;
                    break;
                }
            }

            if (!$parsed) {
                $issues[] = "Invalid date format for {$field}: {$value}";
            }
        }

        return [
            'valid' => empty($issues),
            'issues' => $issues,
        ];
    }

    private function checkExpiry(array $ocrData): array
    {
        $expiryDate = $ocrData['expiry_date'] ?? null;

        if ($expiryDate === null || trim((string) $expiryDate) === '') {
            return [
                'valid' => true,
                'note' => 'No expiry date field for this document type',
            ];
        }

        $cleaned = preg_replace('/[^0-9\-\.\/]/', '', $expiryDate);
        $formats = ['Y-m-d', 'Y/m/d', 'Y.m.d', 'd-m-Y', 'd/m/Y', 'd.m.Y']; // try Y-first then d-first
        $parsedDate = null;

        foreach ($formats as $format) {
            $dt = \DateTime::createFromFormat($format, $cleaned);
            if ($dt && $dt->format($format) === $cleaned) {
                $parsedDate = $dt;
                break;
            }
        }

        if (!$parsedDate) {
            return [
                'valid' => false,
                'issue' => "Cannot parse expiry date: {$expiryDate}",
            ];
        }

        $now = new \DateTime();
        $isExpired = $parsedDate < $now;

        if ($isExpired) {
            return [
                'valid' => false,
                'issue' => "Document expired on {$parsedDate->format('Y-m-d')}",
                'expiry_date' => $parsedDate->format('Y-m-d'),
                'expired' => true,
            ];
        }

        $monthsUntilExpiry = (int) $now->diff($parsedDate)->format('%m') + ($now->diff($parsedDate)->y * 12);

        return [
            'valid' => true,
            'expiry_date' => $parsedDate->format('Y-m-d'),
            'months_until_expiry' => $monthsUntilExpiry,
            'expired' => false,
        ];
    }

    private function checkOcrCompleteness(array $ocrData): array
    {
        $meaningfulKeys = ['full_name', 'document_number', 'date_of_birth', 'gender', 'address', 'father_name', 'mother_name', 'institution', 'issuing_authority', 'expiry_date'];

        $found = 0;
        foreach ($meaningfulKeys as $key) {
            $value = $ocrData[$key] ?? null;
            if ($value !== null && trim((string) $value) !== '') {
                $found++;
            }
        }

        $rawFields = $ocrData['raw_fields'] ?? [];
        $extraCount = count($rawFields);

        $score = min(100, ($found / count($meaningfulKeys)) * 100 + min(20, $extraCount * 5));

        return [
            'score' => round($score, 2),
            'fields_found' => $found,
            'total_expected_fields' => count($meaningfulKeys),
            'extra_fields' => $extraCount,
        ];
    }
}
