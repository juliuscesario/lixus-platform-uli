<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaignParticipantResource extends JsonResource
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
            'status' => $this->status,
            'applied_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),

            // Informasi Influencer terkait
            // Pastikan relasi 'user' sudah di-eager load di controller
            // UserResource akan menangani pemuatan influencerProfile dan socialMediaAccounts jika di-eager load
            'influencer' => UserResource::make($this->whenLoaded('user')),
        ];
    }
}