<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'tenant_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the role associated with the user.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the tenant that the user belongs to.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the influencer profile associated with the user.
     */
    public function influencerProfile(): HasOne
    {
        return $this->hasOne(InfluencerProfile::class);
    }

    /**
     * Get the social media accounts for the user.
     */
    public function socialMediaAccounts(): HasMany
    {
        return $this->hasMany(SocialMediaAccount::class);
    }

    /**
     * The campaigns that the user participates in.
     */
    public function campaigns(): BelongsToMany
    {
        return $this->belongsToMany(Campaign::class, 'campaign_participants', 'user_id', 'campaign_id')
                    ->withPivot('status')
                    ->withTimestamps();
    }

    /**
     * Get the campaign participation records for the user.
     */
    public function campaignParticipants(): HasMany
    {
        return $this->hasMany(CampaignParticipant::class);
    }

    /**
     * Get the posts for the user.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Get the scores for the user.
     */
    public function scores(): HasMany
    {
        return $this->hasMany(Score::class);
    }

    /**
     * Check if the user has the 'admin' role.
     */
    public function isAdmin(): bool
    {
        return $this->role && $this->role->name === 'admin';
    }

    /**
     * Check if the user has the 'influencer' role.
     */
    public function isInfluencer(): bool
    {
        return $this->role && $this->role->name === 'influencer';
    }

    /**
     * Check if the user has the 'brand' role.
     */
    public function isBrand(): bool
    {
        return $this->role && $this->role->name === 'brand';
    }

    /**
     * Check if the user has a specific role.
     */
    public function hasRole($roleName): bool
    {
        return $this->role && $this->role->name === $roleName;
    }
}