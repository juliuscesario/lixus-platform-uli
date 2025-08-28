<?php

namespace App\Services;

use App\Models\Post;
use App\Models\Campaign;
use App\Models\Score;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ScoringService
{
    public function calculatePostScore(Post $post): ?Score
    {
        $post->loadMissing('campaign');
        $campaign = $post->campaign;

        if (!$campaign) {
            Log::warning("Post {$post->id} is not associated with a campaign. Skipping scoring.");
            return null;
        }

        $scoringLogic = $campaign->scoring_logic;
        $metrics = $post->metrics;

        $viewScore = ($metrics['views_count'] ?? 0) * ($scoringLogic['views'] ?? 1);
        $likeScore = ($metrics['likes_count'] ?? 0) * ($scoringLogic['likes'] ?? 2);
        $commentScore = ($metrics['comments_count'] ?? 0) * ($scoringLogic['comments'] ?? 5);
        $shareScore = ($metrics['shares_count'] ?? 0) * ($scoringLogic['shares'] ?? 8);

        $totalScore = $viewScore + $likeScore + $commentScore + $shareScore;

        // Use a transaction to ensure both tables are updated successfully
        return DB::transaction(function () use ($post, $totalScore) {
            // 1. Create or update the score in the 'scores' table (without details)
            $score = Score::updateOrCreate(
                ['post_id' => $post->id],
                [
                    'user_id' => $post->user_id,
                    'campaign_id' => $post->campaign_id,
                    'score_value' => $totalScore,
                    // 'details' field removed
                ]
            );

            // 2. Update the 'score' column on the 'posts' table
            $post->update(['score' => $totalScore]);

            return $score;
        });
    }

    public function recalculateScoresForCampaign(Campaign $campaign): array
    {
        $posts = $campaign->posts()->where('is_valid_for_campaign', true)->get();
        $processedCount = 0;
        $failedCount = 0;

        foreach ($posts as $post) {
            try {
                $this->calculatePostScore($post);
                $processedCount++;
            } catch (\Exception $e) {
                $failedCount++;
                Log::error("Failed to calculate score for an individual post.", [
                    'post_id' => $post->id,
                    'campaign_id' => $campaign->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return [
            'campaign_id' => $campaign->id,
            'posts_processed' => $processedCount,
            'posts_failed' => $failedCount,
        ];
    }
}