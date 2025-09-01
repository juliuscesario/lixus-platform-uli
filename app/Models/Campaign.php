<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Traits\BelongsToTenant; // <-- Import the new Trait

class Campaign extends Model
{
    use HasFactory, HasUuids, BelongsToTenant; // <-- Use the new Trait

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'tenant_id', // <-- Add tenant_id
        'name',
        'description',
        // 'brand_id' is no longer needed, as the tenant relationship handles this.
        'start_date',
        'end_date',
        'budget',
        'briefing_content',
        'scoring_rules',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'budget' => 'float',
        'briefing_content' => 'array',
        'scoring_rules' => 'array',
    ];

    /**
     * Get the participants for the campaign.
     */
    public function participants()
    {
        return $this->hasMany(CampaignParticipant::class);
    }
    
    /**
     * Get the posts for the campaign.
     */
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Get the participant record for the currently authenticated user for this campaign.
     *
     * This method is useful for quickly checking if the logged-in influencer
     * has already joined the campaign.
     */
    public function currentParticipant(): HasOne
    {
        if (auth()->check()) {
            return $this->hasOne(CampaignParticipant::class)
                        ->where('user_id', auth()->id());
        }

        // Return a query that will yield no results if the user is not logged in.
        // This prevents errors in contexts where there is no authenticated user.
        return $this->hasOne(CampaignParticipant::class)->whereRaw('1 = 0');
    }
}