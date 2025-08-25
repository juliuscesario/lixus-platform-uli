<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InfluencerApplication extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'email',
        'gender',
        'date_of_birth',
        'city',
        'bio',
        'social_media_profiles',
        'status',
        'rejection_reason',
        'approved_by',
    ];

    protected $casts = [
        'social_media_profiles' => 'array',
        'date_of_birth' => 'date',
    ];

    /**
     * Get the user who approved this application.
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}