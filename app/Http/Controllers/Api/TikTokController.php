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
        $params = [
            'client_key' => env('TIKTOK_CLIENT_KEY'),
            'scope' => 'user.info.basic,user.info.profile,user.info.stats,video.list',
            'response_type' => 'code',
            'redirect_uri' => env('TIKTOK_REDIRECT_URI'),
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
                'client_key' => env('TIKTOK_CLIENT_KEY'),
                'client_secret' => env('TIKTOK_CLIENT_SECRET'),
                'code' => $request->code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => env('TIKTOK_REDIRECT_URI'),
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
                    'platform_user_id' => $userData['open_id'], // Corrected column name
                ],
                [
                    'username' => $userData['username'],
                    'access_token' => Crypt::encryptString($accessToken),
                    'refresh_token' => isset($tokenData['refresh_token']) ? Crypt::encryptString($tokenData['refresh_token']) : null,
                    'expires_at' => isset($tokenData['expires_in']) ? now()->addSeconds($tokenData['expires_in']) : null,
                    'meta_data' => $userData,
                ]
            );
            
            // Log the user in to create a session
            Auth::login($user);

            // Redirect directly to the dashboard
            return redirect('/dashboard');

        } catch (\Exception $e) {
            Log::error('An exception occurred during TikTok callback.', ['error' => $e->getMessage()]);
            return redirect('/dashboard')->with('error', 'An unexpected error occurred.');
        }
    }

    public function disconnectTikTok(Request $request)
    {
        $user = Auth::user();
        SocialMediaAccount::where('user_id', $user->id)
            ->where('platform', 'tiktok')
            ->delete();
        return back()->with('success', 'Successfully disconnected your TikTok account.');
    }
}