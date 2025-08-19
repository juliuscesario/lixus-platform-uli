<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Post;
use App\Models\Campaign;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
   public function getBrandPerformanceReport(Request $request)
    {
        try {
            $request->validate([
                'period' => 'sometimes|in:monthly,yearly',
            ]);

            $period = $request->input('period', 'monthly');
            $dateFormat = $period === 'yearly' ? 'YYYY' : 'YYYY-MM';

            $query = Post::select(
                DB::raw("TO_CHAR(posts.created_at, '$dateFormat') as date_key"),
                DB::raw('COUNT(posts.id) as total_posts'),
                DB::raw('COUNT(DISTINCT posts.user_id) as unique_influencers'),
                // Use COALESCE to handle nulls, and add total_shares
                DB::raw("SUM(CAST(COALESCE(metrics->>'likes_count', '0') AS INTEGER)) as total_likes"),
                DB::raw("SUM(CAST(COALESCE(metrics->>'comments_count', '0') AS INTEGER)) as total_comments"),
                DB::raw("SUM(CAST(COALESCE(metrics->>'shares_count', '0') AS INTEGER)) as total_shares") // <-- ADDED SHARES
            )
            ->join('social_media_accounts', 'posts.social_media_account_id', '=', 'social_media_accounts.id')
            ->where('posts.is_valid_for_campaign', true)
            ->groupBy('date_key')
            ->orderBy('date_key', 'asc')
            ->get();

            return response()->json([
                'status' => 'success',
                'data' => $query
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Failed to generate brand performance report.', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while generating the report: ' . $e->getMessage()
            ], 500);
        }
    }

    // ... The other functions remain the same ...

    /**
     * Get a side-by-side comparison of multiple campaigns.
     */
    public function getCampaignComparisonReport(Request $request)
    {
        $request->validate([
            'campaign_ids' => 'required|array|min:1',
            'campaign_ids.*' => 'required|integer|exists:campaigns,id',
        ]);

        try {
            $campaignIds = $request->input('campaign_ids');

            $data = Campaign::with(['posts' => function ($query) {
                $query->where('is_valid_for_campaign', true);
            }])
            ->whereIn('id', $campaignIds)
            ->get();

            $report = $data->map(function ($campaign) {
                $posts = $campaign->posts;
                $metrics = $posts->reduce(function ($carry, $post) {
                    $postMetrics = json_decode($post->metrics, true) ?? [];
                    $carry['likes'] += $postMetrics['likes_count'] ?? 0;
                    $carry['comments'] += $postMetrics['comments_count'] ?? 0;
                    return $carry;
                }, ['likes' => 0, 'comments' => 0]);

                return [
                    'campaign_id' => $campaign->id,
                    'campaign_name' => $campaign->name,
                    'total_posts' => $posts->count(),
                    'unique_influencers' => $posts->pluck('user_id')->unique()->count(),
                    'total_engagement' => $metrics['likes'] + $metrics['comments'],
                    'total_likes' => $metrics['likes'],
                    'total_comments' => $metrics['comments'],
                ];
            });

            return response()->json(['status' => 'success', 'data' => $report], 200);

        } catch (\Throwable $e) {
            Log::error('Failed to generate campaign comparison report.', ['error' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => 'An error occurred during campaign comparison.'], 500);
        }
    }

    /**
     * Get performance data for a specific influencer over time.
     */
    public function getInfluencerPerformanceReport(Request $request, User $user)
    {
        $request->validate([
            'user' => 'required|uuid|exists:users,id',
        ]);
        try {
            $posts = Post::where('user_id', $user->id)
                ->where('is_valid_for_campaign', true)
                ->with('campaign:id,name')
                ->orderBy('created_at', 'desc')
                ->get();

            $campaignPerformance = $posts->groupBy('campaign.name')
                ->map(function ($campaignPosts, $campaignName) {
                    $metrics = $campaignPosts->reduce(function ($carry, $post) {
                        $postMetrics = json_decode($post->metrics, true) ?? [];
                        $carry['likes'] += $postMetrics['likes_count'] ?? 0;
                        $carry['comments'] += $postMetrics['comments_count'] ?? 0;
                        return $carry;
                    }, ['likes' => 0, 'comments' => 0]);

                    return [
                        'campaign_name' => $campaignName,
                        'total_posts' => $campaignPosts->count(),
                        'total_likes' => $metrics['likes'],
                        'total_comments' => $metrics['comments'],
                    ];
                })->values();

            return response()->json([
                'status' => 'success',
                'data' => ['performance_by_campaign' => $campaignPerformance]
            ]);

        } catch (\Throwable $e) {
            Log::error('Failed to generate influencer performance report.', ['error' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => 'An error occurred during influencer report generation.'], 500);
        }
    }
    
    // This helper function is simplified as the main query no longer needs it.
    private function structurePlatformData($data, $keyName)
    {
        // This function can be further developed if you need to split by platform again.
        // For now, the main query handles the aggregation.
        return $data;
    }
}