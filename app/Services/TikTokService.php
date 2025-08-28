<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TikTokService
{
    /**
     * Fetches videos for a specific user and campaign from the TikTok API,
     * filters them by campaign hashtags, and saves them to the database.
     *
     * @param User $user
     * @param Campaign $campaign
     * @return array An array containing the status and a message.
     */
    public function fetchAndSaveUserVideos(User $user, Campaign $campaign): array
    {
        $tiktokAccount = $user->socialMediaAccounts()->where('platform', 'tiktok')->first();

        if (!$tiktokAccount) {
            return ['status' => 'error', 'message' => "User {$user->id} has no TikTok account connected."];
        }

        try {
            $accessToken = Crypt::decryptString($tiktokAccount->access_token);
        } catch (\Exception $e) {
            Log::error('Failed to decrypt TikTok token for user.', ['user_id' => $user->id]);
            return ['status' => 'error', 'message' => "Could not decrypt token for user {$user->id}."];
        }

        $baseUrl = 'https://open.tiktokapis.com/v2/video/list/';
        $queryParams = [
            'fields' => 'id,title,video_description,cover_image_url,share_url,view_count,like_count,comment_count,share_count,create_time'
        ];
        $body = ['max_count' => 20];

        $response = Http::withToken($accessToken)
            ->asJson()
            ->post($baseUrl . '?' . http_build_query($queryParams), $body);

        if ($response->failed()) {
            Log::error('TikTok API request failed during scheduled job.', [
                'user_id' => $user->id,
                'status' => $response->status(),
                'response_body' => $response->body()
            ]);
            return ['status' => 'error', 'message' => "API request failed for user {$user->id}."];
        }

        $responseData = $response->json();
        if (!isset($responseData['data']['videos'])) {
            // This is not necessarily an error; the user may have no videos.
            return ['status' => 'success', 'message' => "No videos found for user {$user->id}."];
        }

        $videos = $responseData['data']['videos'];
        $campaignHashtags = collect($campaign->briefing_content['hashtags'] ?? [])->map(fn($tag) => str_replace('#', '', strtolower($tag)));

        if ($campaignHashtags->isEmpty()) {
            return ['status' => 'error', 'message' => "Campaign {$campaign->id} has no hashtags."];
        }

        $savedPostsCount = 0;
        foreach ($videos as $video) {
            $description = strtolower($video['video_description'] ?? '');
            if ($campaignHashtags->some(fn($hashtag) => Str::contains($description, $hashtag))) {
                Post::updateOrCreate(
                    [
                        'platform_post_id' => $video['id'],
                        'user_id' => $user->id,
                        'campaign_id' => $campaign->id,
                    ],
                    [
                        'social_media_account_id' => $tiktokAccount->id,
                        'platform' => 'tiktok',
                        'post_type' => 'video',
                        'post_url' => $video['share_url'] ?? null,
                        'media_url' => $video['cover_image_url'] ?? null,
                        'caption' => $video['video_description'] ?? null,
                        'metrics' => [
                            'views_count' => $video['view_count'] ?? 0,
                            'likes_count' => $video['like_count'] ?? 0,
                            'comments_count' => $video['comment_count'] ?? 0,
                            'shares_count' => $video['share_count'] ?? 0,
                        ],
                        'posted_at' => date('Y-m-d H:i:s', $video['create_time']),
                        'is_valid_for_campaign' => true,
                    ]
                );
                $savedPostsCount++;
            }
        }

        return ['status' => 'success', 'message' => "Saved {$savedPostsCount} new/updated posts for user {$user->id}."];
    }
}