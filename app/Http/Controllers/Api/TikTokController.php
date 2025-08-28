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

class TikTokController extends Controller
{
    public function redirectToTikTok()
    {
        $state = Str::random(40);
        Cache::put('tiktok_state_'.$state, Auth::id(), now()->addMinutes(10));
        $baseUrl = 'https://www.tiktok.com/v2/auth/authorize/';
        
        // ✅ MENGGUNAKAN config() BUKAN env()
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
            // ✅ MENGGUNAKAN config() BUKAN env()
            $tokenResponse = Http::asForm()->post('https://open.tiktokapis.com/v2/oauth/token/', [
                'client_key' => config('services.tiktok.client_key'),
                'client_secret' => config('services.tiktok.client_secret'),
                'code' => $request->code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => config('services.tiktok.redirect_uri'),
            ]);

            if ($tokenResponse->failed()) { return redirect('/dashboard')->with('error', 'Failed to get TikTok access token.'); }

            // ... sisa kodenya sama ...
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
    
    // ... fungsi disconnectTikTok Anda ...
    public function disconnectTikTok(Request $request)
    {
        $user = Auth::user();
        if ($user) {
            $user->socialMediaAccounts()->where('platform', 'tiktok')->delete();
            return response()->json(['message' => 'Successfully disconnected your TikTok account.']);
        }
        return response()->json(['message' => 'User not authenticated.'], 401);
    }
}