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
        // Ambil ID campaign dan influencer yang sudah ada
        // Pastikan campaign ini ada di CampaignSeeder
        $campaignPepsodent = Campaign::where('name', 'Pepsodent Senyum Indonesia')->first();
        $campaignLifebuoy = Campaign::where('name', 'Lifebuoy Lindungi Keluarga')->first();

        // Pastikan influencer ini ada di UserSeeder
        $influencerA = User::where('email', 'influencerA@example.com')->first();
        $influencerB = User::where('email', 'influencerB@example.com')->first();

        // Hanya lanjutkan jika semua entitas ditemukan
        if ($campaignPepsodent && $influencerA) {
            CampaignParticipant::firstOrCreate(
                [
                    'campaign_id' => $campaignPepsodent->id,
                    'user_id' => $influencerA->id,
                ],
                [
                    'status' => 'approved', // Contoh status
                    'applied_at' => now(),
                ]
            );
        } else {
            \Log::warning('Campaign "Pepsodent Senyum Indonesia" or Influencer A not found for CampaignParticipantSeeder.');
        }

        if ($campaignLifebuoy && $influencerB) {
            CampaignParticipant::firstOrCreate(
                [
                    'campaign_id' => $campaignLifebuoy->id,
                    'user_id' => $influencerB->id,
                ],
                [
                    'status' => 'pending', // Contoh status
                    'applied_at' => now(),
                ]
            );
        } else {
            \Log::warning('Campaign "Lifebuoy Lindungi Keluarga" or Influencer B not found for CampaignParticipantSeeder.');
        }
    }
}