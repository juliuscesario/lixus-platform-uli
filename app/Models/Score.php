<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // Import untuk relasi
use Illuminate\Database\Eloquent\Concerns\HasUuids; // Import HasUuids

class Score extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'post_id',
        'user_id',
        'campaign_id',
        'score_value',
        'score_details',
    ];

    protected $casts = [
        'score_value' => 'float',
        'score_details' => 'array', // Mengubah JSONB menjadi array PHP
    ];

    /**
     * Get the post that the score belongs to.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Get the user (influencer) that the score belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the campaign that the score belongs to.
     */
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }
}