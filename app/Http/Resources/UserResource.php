<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\InfluencerProfileResource;
use App\Http\Resources\RoleResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at ? $this->email_verified_at->format('Y-m-d H:i:s') : null,
            'created_at' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->updated_at ? $this->updated_at->format('Y-m-d H:i:s') : null,
            
            'role' => $this->whenLoaded('role', fn() => $this->role->name),
            'influencer_profile' => InfluencerProfileResource::make($this->whenLoaded('influencerProfile')),
            'social_media_accounts' => SocialMediaAccountResource::collection($this->whenLoaded('socialMediaAccounts')),
            'permissions' => [
                'is_admin' => $this->isAdmin(),
                'is_brand' => $this->isBrand(),
                'is_influencer' => $this->isInfluencer(),
            ],
        ];
    }
}