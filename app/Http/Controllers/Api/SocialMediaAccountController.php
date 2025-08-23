<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SocialMediaAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SocialMediaAccountController extends Controller
{
    /**
     * Display a listing of the resource (Authenticated User's accounts).
     */
    public function index(Request $request)
    {
        return response()->json($request->user()->socialMediaAccounts);
    }

    /**
     * Store a newly created resource in storage (Authenticated User).
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'platform' => 'required|string|in:instagram,tiktok',
            'platform_user_id' => 'required|string|unique:social_media_accounts,platform_user_id',
            'username' => 'required|string',
            'access_token' => 'required|string',
            'token_expires_at' => 'nullable|date',
            'instagram_business_account_id' => 'nullable|string',
            'facebook_page_id' => 'nullable|string',
        ]);

        $data = $request->all();
        $data['access_token'] = encrypt($data['access_token']);
        $account = $user->socialMediaAccounts()->create($data);

        return response()->json($account, 201);
    }

    /**
     * Display the specified resource (Authenticated User's account).
     */
    public function show(SocialMediaAccount $socialMediaAccount)
    {
        if ($socialMediaAccount->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($socialMediaAccount);
    }

    /**
     * Update the specified resource in storage (Authenticated User's account).
     */
    public function update(Request $request, SocialMediaAccount $socialMediaAccount)
    {
        if ($socialMediaAccount->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'username' => 'sometimes|required|string',
            'access_token' => 'sometimes|required|string',
            'token_expires_at' => 'sometimes|nullable|date',
            // ... kolom lain yang bisa diupdate
        ]);

        $data = $request->all();
        if ($request->has('access_token')) {
            $data['access_token'] = encrypt($data['access_token']);
        }
        $socialMediaAccount->update($data);
        return response()->json($socialMediaAccount);
    }

    /**
     * Remove the specified resource from storage (Authenticated User's account).
     */
    public function destroy(SocialMediaAccount $socialMediaAccount)
    {
        if ($socialMediaAccount->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $socialMediaAccount->delete();
        return response()->json(null, 204);
    }

    /**
     * Simulate syncing posts from social media API (Authenticated User).
     * This method would typically call external social media APIs.
     */
    public function syncPosts(Request $request, SocialMediaAccount $socialMediaAccount)
    {
        if ($socialMediaAccount->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Placeholder for actual API call to Instagram/TikTok
        // For demo, just return a success message
        return response()->json(['message' => "Simulating sync for {$socialMediaAccount->platform} account {$socialMediaAccount->username}. (Actual API integration needed here)"]);
    }
}