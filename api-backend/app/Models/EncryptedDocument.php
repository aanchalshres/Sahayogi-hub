<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EncryptedDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_role',
        'owner_id',
        'original_filename',
        'mime_type',
        'file_size',
        'encrypted_file_path',
        'iv',
        'authentication_tag',
        'encryption_algorithm',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}