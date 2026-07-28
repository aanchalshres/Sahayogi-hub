<?php

return [

    'auto_verify_threshold' => (float) env('IDV_AUTO_VERIFY_THRESHOLD', 90),

    'manual_review_threshold' => (float) env('IDV_MANUAL_REVIEW_THRESHOLD', 70),

    'reject_threshold' => (float) env('IDV_REJECT_THRESHOLD', 0),

    'weights' => [
        'ocr_accuracy' => 0.35,
        'image_quality' => 0.25,
        'document_structure' => 0.20,
        'data_consistency' => 0.20,
    ],

    'image_quality' => [
        'min_resolution' => 600,
        'min_brightness' => 60,
        'min_contrast' => 15,
    ],

    'document_structure' => [
        'required_fields' => [
            'citizenship' => ['full_name', 'document_number', 'date_of_birth'],
            'national_id' => ['full_name', 'document_number'],
            'student_id' => ['full_name', 'document_number'],
            'volunteer_card' => ['full_name', 'document_number'],
            'passport' => ['full_name', 'document_number', 'expiry_date'],
        ],
    ],

    'ocr' => [
        'provider' => env('IDV_OCR_PROVIDER', 'tesseract'),
    ],

    'document_validation' => [
        'max_file_size' => 10 * 1024 * 1024,
        'allowed_mime_types' => [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf',
        ],
        'min_image_width' => 600,
        'min_image_height' => 400,
    ],

    'storage' => [
        'documents_disk' => env('IDV_STORAGE_DISK', 'public'),
        'documents_path' => 'identity-verification/documents',
        'selfies_path' => 'identity-verification/selfies',
    ],
];
