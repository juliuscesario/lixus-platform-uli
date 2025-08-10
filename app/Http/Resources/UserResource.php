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
            
            // Return role name as string for frontend compatibility
            'role' => $this->whenLoaded('role', function () {
                return $this->role->name;
            }),
            
            // Include full role details if needed
            'role_details' => new RoleResource($this->whenLoaded('role')),

            // Sertakan influencer_profile jika sudah di-eager load dan jika ini bukan InfluencerProfileResource itu sendiri
            'influencer_profile' => new InfluencerProfileResource($this->whenLoaded('influencerProfile')), // Ini akan mencegah loop jika dipanggil dari InfluencerProfileResource
        ];
    }
}