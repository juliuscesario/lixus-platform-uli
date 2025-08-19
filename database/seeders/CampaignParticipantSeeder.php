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
        $approvedCampaigns = Campaign::where('status', 'approved')->get();

        // Get all influencer users
        $influencers = User::whereHas('role', function ($query) {
            $query->where('name', 'influencer');
        })->get();

        // Ensure we have approved campaigns and influencers
        if ($approvedCampaigns->isEmpty()) {
            \Log::warning('No approved campaigns found. Skipping CampaignParticipantSeeder.');
            return;
        }

        if ($influencers->isEmpty()) {
            \Log::warning('No influencers found. Skipping CampaignParticipantSeeder.');
            return;
        }

        // Distribute 50 influencers randomly across the two approved campaigns
        $influencersToAssign = $influencers->random(min(50, $influencers->count()));

        foreach ($influencersToAssign as $influencer) {
            // Randomly pick one of the approved campaigns
            $randomCampaign = $approvedCampaigns->random();

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