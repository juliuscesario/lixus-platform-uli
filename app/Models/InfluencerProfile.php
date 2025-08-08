<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // Import untuk relasi
use Illuminate\Database\Eloquent\Concerns\HasUuids; // Import HasUuids

class InfluencerProfile extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'bio',
        'follower_range',
        'gender',
        'date_of_birth',
        'city',
        'contact_email',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    /**
     * Get the user that owns the influencer profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}