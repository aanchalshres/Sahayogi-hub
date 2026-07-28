<?php

namespace App\Models\IdentityVerification;

use Illuminate\Database\Eloquent\Model;

class IdentitySelfie extends Model
{
    protected $fillable = [
        'identity_verification_id',
        'file_path',
        'original_name',
        'mime_type',
        'file_size',
        'image_quality_score',
        'is_blurry',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'image_quality_score' => 'float',
        'is_blurry' => 'boolean',
    ];

    public function verification()
    {
        return $this->belongsTo(IdentityVerification::class);
    }
}

