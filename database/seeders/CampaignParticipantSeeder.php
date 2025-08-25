<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Campaign; // Pastikan diimpor
use App\Models\User; // Pastikan diimpor
use App\Models\CampaignParticipant; // Pastikan diimpor

class CampaignParticipantSeeder extends Seeder
{
    public function run(): void
    {
        // Get the two approved campaigns
        $activeCampaigns = Campaign::where('status', 'active')->get();

        // Get all influencer users
        $influencers = User::whereHas('role', function ($query) {
            $query->where('name', 'influencer');
        })->get();

        // Ensure we have active campaigns and influencers
        if ($activeCampaigns->isEmpty()) {
            \Log::warning('No active campaigns found. Skipping CampaignParticipantSeeder.');
            return;
        }

        if ($influencers->isEmpty()) {
            \Log::warning('No influencers found. Skipping CampaignParticipantSeeder.');
            return;
        }

        // Distribute 50 influencers randomly across the two active campaigns
        $influencersToAssign = $influencers->random(min(50, $influencers->count()));

        foreach ($influencersToAssign as $influencer) {
            // Randomly pick one of the active campaigns
            $randomCampaign = $activeCampaigns->random();

            CampaignParticipant::firstOrCreate(
                [
                    'campaign_id' => $randomCampaign->id,
                    'user_id' => $influencer->id,
                ],
                [
                    'status' => 'approved',
                    'applied_at' => now(),
                ]
            );
        }

        // Assign a specific influencer to the pending campaign if it exists
        $pendingCampaign = Campaign::where('name', 'Lifebuoy Lindungi Keluarga')->first();
        $influencerA = User::where('email', 'influencerA@example.com')->first();
        if ($pendingCampaign && $influencerA) {
             CampaignParticipant::firstOrCreate(
                [
                    'campaign_id' => $pendingCampaign->id,
                    'user_id' => $influencerA->id,
                ],
                [
                    'status' => 'pending',
                    'applied_at' => now(),
                ]
            );
        }
    }
}