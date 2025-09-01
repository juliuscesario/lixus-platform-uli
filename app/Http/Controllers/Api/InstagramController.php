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

class InstagramController extends Controller
{
    public function redirectToInstagram()
    {
        $state = Str::random(40);
        Cache::put('instagram_state_'.$state, Auth::id(), now()->addMinutes(10));
        $baseUrl = 'https://api.instagram.com/oauth/authorize';
        
        $params = [
            'client_id' => config('services.instagram.client_id'),
            'redirect_uri' => config('services.instagram.redirect'),
            'scope' => 'user_profile,user_media',
            'response_type' => 'code',
            'state' => $state,
        ];
        $url = $baseUrl . '?' . http_build_query($params);
        return redirect()->away($url);
    }

    public function handleInstagramCallback(Request $request)
    {
        $state = $request->input('state');
        $userId = Cache::pull('instagram_state_'.$state);

        if (!$userId || !($user = User::find($userId))) {
            return redirect('/login')->withErrors('Invalid session or user not found.');
        }

        if ($request->has('error')) {
            return redirect('/dashboard')->with('error', 'Instagram authentication was cancelled.');
        }

        try {
            $tokenResponse = Http::asForm()->post('https://api.instagram.com/oauth/access_token', [
                'client_id' => config('services.instagram.client_id'),
                'client_secret' => config('services.instagram.client_secret'),
                'code' => $request->code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => config('services.instagram.redirect'),
            ]);

            if ($tokenResponse->failed()) {
                return redirect('/dashboard')->with('error', 'Failed to get Instagram access token.');
            }

            $tokenData = $tokenResponse->json();
            $accessToken = $tokenData['access_token'];
            $userIdInstagram = $tokenData['user_id'];

            // Get user profile data from Instagram
            $userResponse = Http::get("https://graph.instagram.com/{$userIdInstagram}", [
                'fields' => 'id,username',
                'access_token' => $accessToken,
            ]);


            if ($userResponse->failed()) {
                return redirect('/dashboard')->with('error', 'Failed to get Instagram user information.');
            }
            
            $userData = $userResponse->json();

            SocialMediaAccount::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'platform' => 'instagram',
                    'platform_user_id' => $userData['id'],
                ],
                [
                    'username' => $userData['username'],
                    'access_token' => Crypt::encryptString($accessToken),
                    'token_expires_at' => now()->addSeconds($tokenData['expires_in']),
                ]
            );
            
            Auth::login($user);
            return redirect('/dashboard');

        } catch (\Exception $e) {
            Log::error('An exception occurred during Instagram callback.', ['error' => $e->getMessage()]);
            return redirect('/dashboard')->with('error', 'An unexpected error occurred.');
        }
    }
    
    public function disconnectInstagram(Request $request)
    {
        $user = Auth::user();
        if ($user) {
            $user->socialMediaAccounts()->where('platform', 'instagram')->delete();
            return response()->json(['message' => 'Successfully disconnected your Instagram account.']);
        }
        return response()->json(['message' => 'User not authenticated.'], 401);
    }
}