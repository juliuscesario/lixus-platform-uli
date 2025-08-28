<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\ScoringService;
use App\Services\TikTokService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncCampaignPosts extends Command
{
    protected $signature = 'app:sync-campaign-posts';
    protected $description = 'Sync posts and calculate scores for all participants in active campaigns';

    /**
     * Execute the console command.
     */
    public function handle(TikTokService $tiktokService, ScoringService $scoringService)
    {
        try {
            $this->info('Starting campaign post synchronization and scoring...');
            Log::info('Starting scheduled campaign post synchronization and scoring job.');

            // Find all users who are participants in at least one active campaign.
            $participants = User::whereHas('campaigns', function ($query) {
                // ✅ THE FIX IS HERE: Specify the table name 'campaigns.status'
                $query->where('campaigns.status', 'active')->where('end_date', '>=', now());
            })
            // Eager load the specific active campaigns and the social media accounts for these users.
            ->with(['campaigns' => function ($query) {
                // ✅ AND HERE: Specify the table name 'campaigns.status'
                $query->where('campaigns.status', 'active')->where('end_date', '>=', now());
            }, 'socialMediaAccounts'])
            ->get();


            if ($participants->isEmpty()) {
                $this->info('No participants found in active campaigns. Exiting.');
                Log::info('No participants to process.');
                return Command::SUCCESS;
            }

            $this->info("Found {$participants->count()} participants in active campaigns.");

            // Loop through each participant
            foreach ($participants as $participant) {
                $this->info("Processing participant: {$participant->name}");
                
                // Then loop through their active campaigns
                foreach ($participant->campaigns as $campaign) {
                    $this->line("  - Campaign: {$campaign->name}");
                    if ($participant->socialMediaAccounts->where('platform', 'tiktok')->isNotEmpty()) {
                        $tiktokService->fetchAndSaveUserVideos($participant, $campaign);
                    }
                }
            }
            
            // Now, fetch the active campaigns again to run the scoring process
            $activeCampaigns = \App\Models\Campaign::where('status', 'active')
                ->where('end_date', '>=', now())
                ->get();

            foreach ($activeCampaigns as $campaign) {
                $this->info("Calculating scores for campaign: {$campaign->name}");
                $result = $scoringService->recalculateScoresForCampaign($campaign);
                $this->info("Finished calculating scores. Processed {$result['posts_processed']} posts, Failed: {$result['posts_failed']}.");
                Log::info("Finished scoring for campaign {$campaign->id}. Processed {$result['posts_processed']}, Failed: {$result['posts_failed']}.");
            }


            $this->info('Campaign synchronization and scoring finished successfully.');
            Log::info('Finished scheduled campaign post synchronization and scoring job successfully.');
            
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('An unexpected error occurred during the sync process.');
            $this->error($e->getMessage());
            Log::critical('The app:sync-campaign-posts command failed unexpectedly.', [
                'error_message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => \Illuminate\Support\Str::limit($e->getTraceAsString(), 2000),
            ]);
            
            return Command::FAILURE;
        }
    }
}