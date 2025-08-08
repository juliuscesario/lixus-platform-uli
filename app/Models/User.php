<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Concerns\HasUuids; // Pastikan ini ada jika menggunakan UUID

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany; // Pastikan ini diimpor

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids; // Pastikan HasUuids ada

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function influencerProfile(): HasOne
    {
        return $this->hasOne(InfluencerProfile::class);
    }

    public function socialMediaAccounts(): HasMany
    {
        return $this->hasMany(SocialMediaAccount::class);
    }

    /**
     * The campaigns that the user participates in.
     * Menggunakan tabel pivot 'campaign_participants'
     */
    public function campaigns(): BelongsToMany
    {
        return $this->belongsToMany(Campaign::class, 'campaign_participants', 'user_id', 'campaign_id')
                    ->withPivot('status') // <-- PASTIkan ini 'status', bukan 'participation_status'
                    ->withTimestamps();
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function scores(): HasMany
    {
        return $this->hasMany(Score::class);
    }

    // Helper methods untuk memeriksa role (jika digunakan)
    public function isAdmin(): bool
    {
        return $this->role && $this->role->name === 'admin';
    }

    public function isInfluencer(): bool
    {
        return $this->role && $this->role->name === 'influencer';
    }
}