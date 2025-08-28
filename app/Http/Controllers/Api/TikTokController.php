<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SocialMediaAccount;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Models\Campaign;
use App\Models\Post;

class TikTokController extends Controller
{
    public function redirectToTikTok()
    {
        $state = Str::random(40);
        Cache::put('tiktok_state_'.$state, Auth::id(), now()->addMinutes(10));
        $baseUrl = 'https://www.tiktok.com/v2/auth/authorize/';
        
        $params = [
            'client_key' => config('services.tiktok.client_key'),
            'scope' => 'user.info.basic,user.info.profile,user.info.stats,video.list',
            'response_type' => 'code',
            'redirect_uri' => config('services.tiktok.redirect_uri'),
            'state' => $state,
        ];
        $url = $baseUrl . '?' . http_build_query($params);
        return redirect()->away($url);
    }

    public function handleTikTokCallback(Request $request)
    {
        $state = $request->input('state');
        $userId = Cache::pull('tiktok_state_'.$state);
        if (!$userId || !($user = User::find($userId))) {
            return redirect('/login')->withErrors('Invalid session or user not found.');
        }

        if ($request->has('error')) {
            return redirect('/dashboard')->with('error', 'TikTok authentication was cancelled.');
        }

        try {
            $tokenResponse = Http::asForm()->post('https://open.tiktokapis.com/v2/oauth/token/', [
                'client_key' => config('services.tiktok.client_key'),
                'client_secret' => config('services.tiktok.client_secret'),
                'code' => $request->code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => config('services.tiktok.redirect_uri'),
            ]);

            if ($tokenResponse->failed()) { return redirect('/dashboard')->with('error', 'Failed to get TikTok access token.'); }

            $tokenData = $tokenResponse->json();
            $accessToken = $tokenData['access_token'];
            $userResponse = Http::withToken($accessToken)->get('https://open.tiktokapis.com/v2/user/info/', [
                'fields' => 'open_id,union_id,avatar_url,display_name,username,profile_deep_link,follower_count'
            ]);

            if ($userResponse->failed()) { return redirect('/dashboard')->with('error', 'Failed to get TikTok user information.'); }
            
            $userData = $userResponse->json()['data']['user'];
            SocialMediaAccount::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'platform' => 'tiktok',
                    'platform_user_id' => $userData['open_id'],
                ],
                [
                    'username' => $userData['username'],
                    'access_token' => Crypt::encryptString($accessToken),
                    'refresh_token' => isset($tokenData['refresh_token']) ? Crypt::encryptString($tokenData['refresh_token']) : null,
                    'token_expires_at' => isset($tokenData['expires_in']) ? now()->addSeconds($tokenData['expires_in']) : null,
                    'meta_data' => $userData,
                ]
            );
            
            Auth::login($user);
            return redirect('/dashboard');

        } catch (\Exception $e) {
            Log::error('An exception occurred during TikTok callback.', ['error' => $e->getMessage()]);
            return redirect('/dashboard')->with('error', 'An unexpected error occurred.');
        }
    }
    
    public function disconnectTikTok(Request $request)
    {
        $user = Auth::user();
        if ($user) {
            $user->socialMediaAccounts()->where('platform', 'tiktok')->delete();
            return response()->json(['message' => 'Successfully disconnected your TikTok account.']);
        }
        return response()->json(['message' => 'User not authenticated.'], 401);
    }

    public function fetchUserVideos(Request $request)
    {
        try {
            $request->validate([
                'campaign_id' => 'required|uuid|exists:campaigns,id',
            ]);

            $user = Auth::user();
            $campaign = Campaign::findOrFail($request->input('campaign_id'));
            $tiktokAccount = $user->socialMediaAccounts()->where('platform', 'tiktok')->first();

            if (!$tiktokAccount) {
                return response()->json(['message' => 'TikTok account not connected.'], 400);
            }

            try {
                $accessToken = Crypt::decryptString($tiktokAccount->access_token);
            } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
                Log::error('Failed to decrypt TikTok access token. This might be an APP_KEY issue.', [
                    'user_id' => $user->id, 'error' => $e->getMessage(),
                ]);
                return response()->json(['message' => 'Could not authenticate with TikTok. Please reconnect your account.'], 500);
            }

            $baseUrl = 'https://open.tiktokapis.com/v2/video/list/';
            $queryParams = [
                'fields' => 'id,title,video_description,cover_image_url,share_url,view_count,like_count,comment_count,share_count,create_time'
            ];
            $body = [
                'max_count' => 20
            ];

            $videoResponse = Http::withToken($accessToken)
                ->asJson()
                ->post($baseUrl . '?' . http_build_query($queryParams), $body);

            if ($videoResponse->failed()) {
                Log::error('TikTok API request to fetch videos failed.', [
                    'user_id' => $user->id, 'status' => $videoResponse->status(), 'response_body' => $videoResponse->body()
                ]);
                return response()->json(['message' => 'Failed to fetch videos from TikTok. Their server responded with an error.'], 500);
            }

            $responseData = $videoResponse->json();

            if (!isset($responseData['data']['videos'])) {
                if (isset($responseData['error']) && $responseData['error']['code'] != 'ok') {
                     Log::error('TikTok API returned an error in the response body.', [
                        'user_id' => $user->id, 'response_body' => $responseData
                    ]);
                    return response()->json(['message' => 'Received an error from TikTok: ' . $responseData['error']['message']], 500);
                }
                return response()->json(['message' => 'Successfully checked for videos, but none were found.', 'data' => []]);
            }

            $videoData = $responseData['data'];
            $campaignHashtags = collect($campaign->briefing_content['hashtags'] ?? [])->map(fn($tag) => str_replace('#', '', strtolower($tag)));

            if ($campaignHashtags->isEmpty()) {
                return response()->json(['message' => 'This campaign does not have any hashtags to match against.'], 400);
            }

            $savedPosts = [];

            foreach ($videoData['videos'] as $video) {
                $description = strtolower($video['video_description'] ?? '');
                $hasCampaignHashtag = $campaignHashtags->some(fn($hashtag) => Str::contains($description, $hashtag));

                if ($hasCampaignHashtag) {
                    $post = Post::updateOrCreate(
                        [
                            'platform_post_id' => $video['id'], 'user_id' => $user->id, 'campaign_id' => $campaign->id,
                        ],
                        [
                            'social_media_account_id' => $tiktokAccount->id,
                            'platform' => 'tiktok',
                            'post_type' => 'video',
                            'post_url' => $video['share_url'] ?? null,
                            'media_url' => $video['cover_image_url'] ?? null, // Now safe to pass null
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
                    $savedPosts[] = $post;
                }
            }

            return response()->json([
                'message' => 'Successfully fetched and saved ' . count($savedPosts) . ' relevant TikTok videos.',
                'data' => $savedPosts,
            ]);

        } catch (\Exception $e) {
            Log::error('An unexpected exception occurred in fetchUserVideos.', [
                'error_message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => Str::limit($e->getTraceAsString(), 2000),
            ]);
            return response()->json(['message' => 'An unexpected server error occurred. The issue has been logged.'], 500);
        }
    }
}