<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaignLeaderboardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // $this di sini akan merepresentasikan setiap item dari $leaderboardData
        // yang sudah digabung dengan relasi 'user'

        return [
            'user_id' => $this->user_id,
            'influencer_name' => $this->user->name ?? 'N/A',
            'influencer_email' => $this->user->email ?? null, // Opsional: Email influencer
            'influencer_avatar' => $this->user->influencerProfile->avatar_url ?? null,
            'social_media_platforms' => $this->user->socialMediaAccounts->pluck('platform')->unique()->values(),
            'total_score' => (float) $this->total_score,
            // Jika Anda menambahkan metrik agregat lain di query,
            // Anda bisa menampilkannya di sini juga. Contoh:
            // 'total_likes_campaign' => (int) $this->total_likes_campaign,
            'details_link' => route('api.public.influencers.show', ['user' => $this->user_id]), // Contoh: link ke detail influencer
        ];
    }
}