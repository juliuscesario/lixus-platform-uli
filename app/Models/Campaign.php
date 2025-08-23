<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasOne; // <--- Pastikan ini diimpor
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Campaign extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'description',
        'brand_id',
        'start_date',
        'end_date',
        'budget',
        'briefing_content',
        'scoring_rules',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'budget' => 'float',
        'briefing_content' => 'array',
        'scoring_rules' => 'array',
    ];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(User::class, 'brand_id');
    }

    public function participants()
    {
        return $this->hasMany(CampaignParticipant::class);
    }
    
    public function posts()
    {
        return $this->hasMany(Post::class);
    }


    /**
     * Get the participant record for the currently authenticated user for this campaign.
     */
    public function currentParticipant(): HasOne // <--- Pastikan metode ini ada
    {
        if (auth()->check()) {
            return $this->hasOne(CampaignParticipant::class)
                        ->where('user_id', auth()->id());
        }
        // Mengembalikan query yang tidak akan menghasilkan hasil jika user tidak login
        // Ini penting agar tidak crash saat testing tanpa autentikasi atau di context lain
        return $this->hasOne(CampaignParticipant::class)->whereRaw('1 = 0');
    }
}