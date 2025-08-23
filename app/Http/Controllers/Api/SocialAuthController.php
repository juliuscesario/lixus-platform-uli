<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the TikTok authentication page.
     */
    public function redirectToTikTok(Request $request)
    {
        $user = Auth::user();
        $signature = hash_hmac('sha256', $user->id, config('app.key'));
        $state = $user->id . '.' . $signature;
        $query = http_build_query([
            'client_key' => config('services.tiktok.client_key'),
            'redirect_uri' => config('services.tiktok.redirect_uri'),
            'response_type' => 'code',
            // --- CHANGE #1: ADDED 'user.info.stats' SCOPE ---
            'scope' => 'user.info.basic,video.list,user.info.stats',
            'state' => $state,
        ]);
        $url = 'https://www.tiktok.com/v2/auth/authorize/?' . $query;
        return redirect()->away($url);
    }

    /**
     * Handle the callback from TikTok after user authorization.
     */
    public function handleTikTokCallback(Request $request)
    {
        // ... (state verification logic remains the same)
        if ($request->has('error')) {
            Log::error('TikTok callback error', $request->all());
            return redirect('https://jul-proto.lixus.id/social-media?error=tiktok_denied');
        }
        if (!$request->has('state') || !str_contains($request->state, '.')) {
             return redirect('https://jul-proto.lixus.id/social-media?error=invalid_state');
        }
        list($userId, $signature) = explode('.', $request->state, 2);
        $expectedSignature = hash_hmac('sha256', $userId, config('app.key'));
        if (!hash_equals($expectedSignature, $signature)) {
            return redirect('https://jul-proto.lixus.id/social-media?error=invalid_signature');
        }

        // ... (token exchange logic remains the same)
        $response = Http::asForm()->post('https://open.tiktokapis.com/v2/oauth/token/', [
            'client_key' => config('services.tiktok.client_key'),
            'client_secret' => config('services.tiktok.client_secret'),
            'code' => $request->code,
            'grant_type' => 'authorization_code',
            'redirect_uri' => config('services.tiktok.redirect_uri'),
        ]);
        if ($response->failed()) {
            Log::error('TikTok token exchange failed', $response->json());
            return redirect('https://jul-proto.lixus.id/social-media?error=token_exchange_failed');
        }
        $tokenData = $response->json();
        
        // --- CHANGE #2: FETCH BOTH USER INFO AND STATS ---
        $userResponse = Http::withToken($tokenData['access_token'])
        ->get('https://open.tiktokapis.com/v2/user/info/', [
            // Temporarily REMOVE follower_count, likes_count
            'fields' => 'open_id,union_id,avatar_url,display_name,username'
        ]);


        if ($userResponse->failed()) {
             Log::error('TikTok user info fetch failed', $userResponse->json());
            return redirect('https://jul-proto.lixus.id/social-media?error=user_info_failed');
        }
        $tiktokUser = $userResponse->json()['data']['user'];
        $user = User::find($userId);
        if (!$user) {
             Log::error('User not found during TikTok callback', ['user_id' => $userId]);
             return redirect('https://jul-proto.lixus.id/social-media?error=user_not_found');
        }

        // Save the Social Media Account details
        $user->socialMediaAccounts()->updateOrCreate(
            ['platform' => 'tiktok', 'platform_user_id' => $tiktokUser['open_id']],
            [
                'username' => $tiktokUser['username'] ?? 'N/A',
                'display_name' => $tiktokUser['display_name'],
                'avatar_url' => $tiktokUser['avatar_url'],
                'access_token' => $tokenData['access_token'],
                'refresh_token' => $tokenData['refresh_token'],
                'scopes' => explode(',', $tokenData['scope']),
                'expires_in' => now()->addSeconds($tokenData['expires_in']),
            ]
        );

        // --- CHANGE #3: SAVE STATS TO INFLUENCER PROFILE ---
        if ($user->influencerProfile) {
            $user->influencerProfile->update([
                'tiktok_follower_count' => $tiktokUser['follower_count'] ?? 0,
                'tiktok_likes_count' => $tiktokUser['likes_count'] ?? 0,
            ]);
        }

        return redirect('https://jul-proto.lixus.id/social-media?success=tiktok_connected');
    }

    // --- CHANGE #4: ADDED NEW METHOD TO SYNC VIDEOS ---
    /**
     * Fetch recent videos from TikTok and save them as posts.
     */
    public function syncTikTokVideos(Request $request)
    {
        $user = $request->user();
        $tiktokAccount = $user->socialMediaAccounts()->where('platform', 'tiktok')->first();

        if (!$tiktokAccount) {
            return response()->json(['message' => 'TikTok account not connected.'], 400);
        }

        $response = Http::withToken($tiktokAccount->access_token)
            ->post('https://open.tiktokapis.com/v2/video/list/', [
                'fields' => 'id,create_time,video_description,like_count,comment_count,share_count,view_count',
                'max_count' => 20
            ]);

        if ($response->failed()) {
            Log::error('TikTok video fetch failed', $response->json());
            return response()->json(['message' => 'Failed to fetch videos from TikTok. Check logs for details.'], 500);
        }

        $videos = $response->json()['data']['videos'];
        $syncedCount = 0;

        foreach ($videos as $video) {
            $user->posts()->updateOrCreate(
                [
                    'platform' => 'tiktok',
                    'platform_post_id' => $video['id']
                ],
                [
                    // Assuming 'user_id' is already set by the relationship
                    'caption' => $video['video_description'],
                    'posted_at' => \Carbon\Carbon::createFromTimestamp($video['create_time']),
                    'metrics' => [
                        'likes' => $video['like_count'],
                        'comments' => $video['comment_count'],
                        'shares' => $video['share_count'],
                        'views' => $video['view_count']
                    ]
                    // campaign_id should be linked separately, perhaps via the frontend
                ]
            );
            $syncedCount++;
        }
        
        return response()->json(['message' => "Successfully synced {$syncedCount} videos."]);
    }
}