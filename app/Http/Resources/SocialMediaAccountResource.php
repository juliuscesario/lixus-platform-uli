<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SocialMediaAccountResource extends JsonResource
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
            'user_id' => $this->user_id,
            'platform' => $this->platform,
            'platform_user_id' => $this->platform_user_id,
            'username' => $this->username,
            // Access token tidak disarankan untuk ditampilkan di API publik
            // 'access_token' => $this->access_token,
            'token_expires_at' => $this->token_expires_at ? $this->token_expires_at->toIso8601String() : null,
            'instagram_business_account_id' => $this->instagram_business_account_id,
            'facebook_page_id' => $this->facebook_page_id,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}