<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaignResource extends JsonResource
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
            'description' => $this->description,
            'brand_id' => $this->brand_id,
            'brand_name' => $this->whenLoaded('brand', fn () => $this->brand->name ?? null),
            'start_date' => $this->start_date ? $this->start_date->format('Y-m-d') : null,
            'end_date' => $this->end_date ? $this->end_date->format('Y-m-d') : null,
            'budget' => (float) $this->budget,
            'briefing_content' => $this->briefing_content ?? [],
            'scoring_rules' => $this->scoring_rules ?? [],
            'status' => $this->status,
            'created_at' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->updated_at ? $this->updated_at->format('Y-m-d H:i:s') : null,
            
            // ✅ FIX: Add aggregate data when it has been calculated and attached in the controller
            'total_participants' => $this->when(isset($this->total_participants), $this->total_participants),
            'total_posts' => $this->when(isset($this->total_posts), $this->total_posts),
            'total_likes' => $this->when(isset($this->total_likes), $this->total_likes),
            'total_comments' => $this->when(isset($this->total_comments), $this->total_comments),
            'total_points' => $this->when(isset($this->total_points), fn() => (float) $this->total_points),

            // Tambahkan field status partisipasi
            'participant_status' => $this->whenLoaded('currentParticipant', function () {
                return $this->currentParticipant ? $this->currentParticipant->status : null;
            }),
        ];
    }
}