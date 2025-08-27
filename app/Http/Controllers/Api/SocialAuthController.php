<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\SocialMediaAccount;

class SocialAuthController extends Controller
{
    /**
     * Redirect to TikTok OAuth
     */
    public function redirectToProvider($provider)
    {
        if ($provider !== 'tiktok') {
            abort(404);
        }

        $clientKey = config('services.tiktok.client_key');
        $redirectUri = config('services.tiktok.redirect_uri');
        $scope = 'user.info.basic,user.info.profile,user.info.stats';

        $params = [
            'client_key' => $clientKey,
            'scope' => $scope,
            'response_type' => 'code',
            'redirect_uri' => $redirectUri,
            'state' => csrf_token(), // Use CSRF token as state
        ];

        $url = 'https://www.tiktok.com/v2/auth/authorize/?' . http_build_query($params);
        
        return redirect($url);
    }

    /**
     * Handle TikTok OAuth callback
     */
    public function handleProviderCallback(Request $request, $provider)
    {
        if ($provider !== 'tiktok') {
            abort(404);
        }

        try {
            // Check if user is authenticated
            if (!Auth::check()) {
                // Redirect to login with return URL
                return redirect('/login?error=authentication_required&message=' . urlencode('Please log in first to connect your TikTok account.'));
            }

            $code = $request->get('code');
            $state = $request->get('state');
            $error = $request->get('error');

            // Handle OAuth errors
            if ($error) {
                Log::warning('TikTok OAuth error', ['error' => $error, 'error_description' => $request->get('error_description')]);
                return redirect('/profile?error=oauth_error&message=' . urlencode('TikTok connection failed: ' . $error));
            }

            // Verify state parameter (CSRF protection)
            if (!$state) {
                Log::warning('TikTok OAuth missing state parameter');
                return redirect('/profile?error=invalid_state&message=' . urlencode('Invalid OAuth state. Please try again.'));
            }

            if (!$code) {
                Log::warning('TikTok OAuth missing authorization code');
                return redirect('/profile?error=missing_code&message=' . urlencode('Authorization code not received. Please try again.'));
            }

            // Exchange code for access token
            $tokenData = $this->getAccessToken($code);
            
            if (!$tokenData || !isset($tokenData['access_token'])) {
                Log::error('TikTok token exchange failed', ['response' => $tokenData]);
                return redirect('/profile?error=token_failed&message=' . urlencode('Failed to obtain access token from TikTok.'));
            }

            // Get user info from TikTok
            $tiktokUser = $this->getTikTokUserInfo($tokenData['access_token']);
            
            if (!$tiktokUser) {
                Log::error('Failed to retrieve TikTok user info');
                return redirect('/profile?error=user_info_failed&message=' . urlencode('Failed to retrieve user information from TikTok.'));
            }

            // Save or update social media account
            $this->saveSocialMediaAccount(Auth::user(), $tiktokUser, $tokenData);

            return redirect('/profile?success=tiktok_connected&message=' . urlencode('TikTok account connected successfully!'));

        } catch (\Exception $e) {
            Log::error('TikTok OAuth callback error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect('/profile?error=callback_error&message=' . urlencode('An error occurred while connecting to TikTok. Please try again.'));
        }
    }

    /**
     * Exchange authorization code for access token
     */
    private function getAccessToken($code)
    {
        $data = [
            'client_key' => config('services.tiktok.client_key'),
            'client_secret' => config('services.tiktok.client_secret'),
            'code' => $code,
            'grant_type' => 'authorization_code',
            'redirect_uri' => config('services.tiktok.redirect_uri'),
        ];

        $response = $this->makeHttpRequest('https://open.tiktokapis.com/v2/oauth/token/', [
            'headers' => [
                'Content-Type' => 'application/x-www-form-urlencoded',
            ],
            'form_params' => $data,
        ]);

        return $response;
    }

    /**
     * Get TikTok user information
     */
    private function getTikTokUserInfo($accessToken)
    {
        $response = $this->makeHttpRequest('https://open.tiktokapis.com/v2/user/info/', [
            'headers' => [
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json',
            ],
            'query' => [
                'fields' => 'open_id,union_id,avatar_url,display_name,username,follower_count,following_count,likes_count,video_count'
            ]
        ]);

        return $response['data']['user'] ?? null;
    }

    /**
     * Save social media account data
     */
    private function saveSocialMediaAccount(User $user, $tiktokUser, $tokenData)
    {
        SocialMediaAccount::updateOrCreate(
            [
                'user_id' => $user->id,
                'platform' => 'tiktok',
                'platform_user_id' => $tiktokUser['open_id']
            ],
            [
                'username' => $tiktokUser['username'] ?? $tiktokUser['display_name'],
                'display_name' => $tiktokUser['display_name'],
                'avatar_url' => $tiktokUser['avatar_url'],
                'follower_count' => $tiktokUser['follower_count'] ?? 0,
                'following_count' => $tiktokUser['following_count'] ?? 0,
                'total_likes' => $tiktokUser['likes_count'] ?? 0,
                'total_videos' => $tiktokUser['video_count'] ?? 0,
                'access_token' => encrypt($tokenData['access_token']),
                'refresh_token' => isset($tokenData['refresh_token']) ? encrypt($tokenData['refresh_token']) : null,
                'expires_at' => isset($tokenData['expires_in']) ? now()->addSeconds($tokenData['expires_in']) : null,
                'is_active' => true,
                'last_synced_at' => now(),
            ]
        );
    }

    /**
     * Make HTTP request using cURL
     */
    private function makeHttpRequest($url, $options = [])
    {
        $ch = curl_init();

        // Set basic cURL options
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_USERAGENT => 'Lixus-Community-Platform/1.0',
        ]);

        // Handle POST data
        if (isset($options['form_params'])) {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($options['form_params']));
        }

        // Handle query parameters
        if (isset($options['query'])) {
            $separator = strpos($url, '?') !== false ? '&' : '?';
            $url .= $separator . http_build_query($options['query']);
            curl_setopt($ch, CURLOPT_URL, $url);
        }

        // Handle headers
        if (isset($options['headers'])) {
            $headers = [];
            foreach ($options['headers'] as $key => $value) {
                $headers[] = $key . ': ' . $value;
            }
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        curl_close($ch);

        if ($error) {
            Log::error('cURL error', ['error' => $error, 'url' => $url]);
            throw new \Exception('HTTP request failed: ' . $error);
        }

        if ($httpCode >= 400) {
            Log::error('HTTP error', ['code' => $httpCode, 'response' => $response, 'url' => $url]);
            throw new \Exception('HTTP error: ' . $httpCode);
        }

        $decoded = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('JSON decode error', ['response' => $response, 'error' => json_last_error_msg()]);
            throw new \Exception('Invalid JSON response');
        }

        return $decoded;
    }
}