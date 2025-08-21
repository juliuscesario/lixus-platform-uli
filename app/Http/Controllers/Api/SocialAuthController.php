<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use InvalidArgumentException;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the TikTok authentication page.
     */
    public function redirectToTikTok(Request $request)
    {
        // We generate a random 'state' string for security (prevents CSRF attacks)
        $state = Str::random(40);
        // We store it in the session to verify it later in the callback
        $request->session()->put('state', $state);

        // Build the authorization URL
        $query = http_build_query([
            'client_key' => config('services.tiktok.client_key'),
            'redirect_uri' => config('services.tiktok.redirect_uri'),
            'response_type' => 'code',
            'scope' => 'user.info.basic,video.list', // Requesting user info and video list permissions
            'state' => $state,
        ]);

        $url = 'https://www.tiktok.com/v2/auth/authorize/?' . $query;

        // Redirect the user's browser to TikTok
        return redirect()->away($url);
    }

    /**
     * Handle the callback from TikTok after user authorization.
     */
    public function handleTikTokCallback(Request $request)
    {
        // First, check if the state from TikTok matches what we stored in the session
        // If it doesn't match, it could be a security risk, so we abort.
        if ($request->state !== $request->session()->pull('state')) {
            return redirect('https://jul-proto.lixus.id/error?message=invalid_state');
        }

        // --- Step 1: Exchange the Authorization Code for an Access Token ---
        $response = Http::asForm()->post('https://open.tiktokapis.com/v2/oauth/token/', [
            'client_key' => config('services.tiktok.client_key'),
            'client_secret' => config('services.tiktok.client_secret'),
            'code' => $request->code,
            'grant_type' => 'authorization_code',
            'redirect_uri' => config('services.tiktok.redirect_uri'),
        ]);

        if ($response->failed()) {
            // If the token exchange fails, redirect to a frontend error page
            return redirect('https://jul-proto.lixus.id/error?message=token_exchange_failed');
        }

        $tokenData = $response->json();

        // --- Step 2: Use the Access Token to get User Info ---
        $userResponse = Http::withToken($tokenData['access_token'])
            ->get('https://open.tiktokapis.com/v2/user/info/', [
                'fields' => 'open_id,union_id,avatar_url,display_name,username'
            ]);

        if ($userResponse->failed()) {
            return redirect('https://jul-proto.lixus.id/error?message=user_info_failed');
        }

        $tiktokUser = $userResponse->json()['data']['user'];
        $user = session('user'); // Assuming user is stored in session before redirect

        // --- Step 3: Save the Social Media Account to the Database ---
        // Find the user who initiated this. Since this is a stateless callback,
        // we can't use Auth::user(). A common approach is to pass the user_id in the 'state'
        // or have the user log back in briefly. For now, we'll assume the user ID is somehow known.
        // A better, secure method would be to encode the user ID in the state and verify it.
        // NOTE: This part needs a strategy to securely identify the user. Let's start simply.
        // For the prototype, we can fetch the last logged-in user, but this is not production-safe.
        
        // Let's find the user from the state for a more robust solution
        $stateParts = explode('|', $request->state);
        $userId = $stateParts[0] ?? null; // Assume user ID is the first part
        $user = User::find($userId);

        if (!$user) {
             return redirect('https://jul-proto.lixus.id/error?message=user_not_found');
        }

        $user->socialMediaAccounts()->updateOrCreate(
            [
                'platform' => 'tiktok',
                'platform_user_id' => $tiktokUser['open_id'],
            ],
            [
                'username' => $tiktokUser['username'],
                'display_name' => $tiktokUser['display_name'],
                'avatar_url' => $tiktokUser['avatar_url'],
                'access_token' => $tokenData['access_token'],
                'refresh_token' => $tokenData['refresh_token'],
                'scopes' => explode(',', $tokenData['scope']),
                'expires_in' => now()->addSeconds($tokenData['expires_in']),
            ]
        );

        // --- Step 4: Redirect to the frontend success page ---
        return redirect('https://jul-proto.lixus.id/success-auth-tiktok-user');
    }
}