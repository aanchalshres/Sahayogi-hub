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
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function verification()
    {
        return $this->belongsTo(IdentityVerification::class);
    }
}
