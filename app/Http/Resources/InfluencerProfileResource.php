<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\SocialMediaAccountResource;

class InfluencerProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, // UUID dari InfluencerProfile
            'user_id' => $this->user_id, // UUID dari User
            'bio' => $this->bio,
            'username' => $this->username,
            'profile_picture' => $this->profile_picture, // URL atau path ke gambar profil
            'social_media_links' => $this->social_media_links, // JSON atau array dari
            'follower_range' => $this->follower_range,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth,
            'city' => $this->city,
            'contact_email' => $this->contact_email,
            'created_at' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->updated_at ? $this->updated_at->format('Y-m-d H:i:s') : null,

            // Opsional: Muat relasi jika dibutuhkan.
            // Pastikan relasi 'user' didefinisikan di model InfluencerProfile
            // dan Anda sudah eager load user-nya di controller (`$user->load('influencerProfile', 'role')`)
            // Misalnya, jika Anda ingin menyertakan nama dan email user:
            'user' => new UserResource($this->whenLoaded('user')), // Menggunakan UserResource

            // FIX: Load social media accounts from the loaded user relationship
            'social_media_accounts' => $this->when(
                $this->relationLoaded('user') && $this->user->relationLoaded('socialMediaAccounts'),
                function () {
                    return SocialMediaAccountResource::collection($this->user->socialMediaAccounts);
                }
            ),
            'can_update' => optional(auth()->user())->can('update', $this->resource),
        ];
    }
}