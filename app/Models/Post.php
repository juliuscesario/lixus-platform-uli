<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Post extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'campaign_id',
        'user_id',
        'social_media_account_id',
        'platform',
        'platform_post_id',
        'post_type',
        'post_url',
        'media_url',
        'caption',
        'metrics',
        'posted_at',
        'is_valid_for_campaign',
        'validation_notes',
        'score', // ✅ Add this line
    ];

    protected $casts = [
        'metrics' => 'array',
        'posted_at' => 'datetime',
        'is_valid_for_campaign' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function socialMediaAccount()
    {
        return $this->belongsTo(SocialMediaAccount::class);
    }

    public function score()
    {
        return $this->hasOne(Score::class);
    }
    
    // This accessor is no longer needed if we have a direct score column,
    // but it's good to keep as a fallback.
    protected function totalScore(): Attribute
    {
        return Attribute::make(
            get: fn ($value, $attributes) => $attributes['score'] ?? $this->score?->score_value ?? 0,
        );
    }
}