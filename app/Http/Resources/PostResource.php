<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'campaign_id' => $this->campaign_id,
            'user_id' => $this->user_id,
            'social_media_account_id' => $this->social_media_account_id,
            'platform' => $this->platform,
            'post_url' => $this->post_url,
            'metrics' => $this->metrics, // Akan menjadi array/JSON
            'score' => $this->score,
            'is_valid_for_campaign' => $this->is_valid_for_campaign, // Pastikan kolom ini ada di DB dan model
            'validation_notes' => $this->validation_notes, // Pastikan kolom ini ada di DB dan model
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            'campaign' => CampaignResource::make($this->whenLoaded('campaign')), // Load jika relasi campaign dimuat
            'influencer' => UserResource::make($this->whenLoaded('user')), // Menggunakan UserResource jika ada, atau detail user langsung
            'social_media_account' => SocialMediaAccountResource::make($this->whenLoaded('socialMediaAccount')), // Menggunakan influencerProfile jika ada, atau detail user langsung
        ];
    }
}