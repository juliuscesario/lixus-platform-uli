<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // Import untuk relasi
use Illuminate\Database\Eloquent\Relations\HasMany;   // Import untuk relasi
use Illuminate\Database\Eloquent\Concerns\HasUuids; // Import HasUuids

class SocialMediaAccount extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'platform',
        'platform_user_id',
        'username',
        'access_token',
        'token_expires_at',
        'instagram_business_account_id',
        'facebook_page_id',
    ];

    protected $casts = [
        'token_expires_at' => 'datetime',
    ];

    /**
     * Get the user that owns the social media account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the posts for the social media account.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}