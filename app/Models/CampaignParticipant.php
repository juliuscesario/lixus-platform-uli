<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignParticipant extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'user_id',
        'status', // Status of the participation (e.g., 'pending', 'approved', 'rejected')
    ];

    /**
     * Get the campaign that owns the participant record.
     */
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    /**
     * Get the user (influencer) that owns the participant record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}