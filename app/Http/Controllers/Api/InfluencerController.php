<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User; // Mengacu pada model User karena influencer adalah User
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;

class InfluencerController extends Controller
{
    /**
     * Display a listing of the influencers (Public).
     */
    public function index()
    {
        // Hanya tampilkan user dengan role 'influencer' beserta profilnya
        $influencers = User::whereHas('role', function ($query) {
                            $query->where('name', 'influencer');
                        })->with(['influencerProfile', 'socialMediaAccounts'])->get(); // eager load profile and social media

        return response()->json([
            'data' => UserResource::collection($influencers)
        ]);
    }

    /**
     * Display the specified influencer profile (Public).
     */
    public function show(User $user)
    {
        // Pastikan user yang diminta adalah influencer
        if (!$user->isInfluencer()) {
            return response()->json(['message' => 'User is not an influencer.'], 404);
        }

        // Load profil dan akun medsosnya
        $user->load('influencerProfile', 'socialMediaAccounts');

        return response()->json([
            'data' => new UserResource($user)
        ]);
    }

    public function getInfluencerDashboardStats(Request $request, User $user)
    {
        // Pastikan user yang diminta adalah influencer
        if (!$user->isInfluencer()) {
            return response()->json(['message' => 'User is not an influencer.'], 404);
        }

        // Load social media accounts for the user
        $user->load('socialMediaAccounts');

        // Calculate total posts (assuming posts are linked to user)
        $totalPosts = $user->posts()->count();

        // Calculate campaigns joined
        $campaignsJoined = $user->campaignParticipants()->count();

        // Calculate total points earned (assuming a 'score' relationship or direct field)
        // This assumes a direct relationship or field for total points.
        // You might need to adjust this based on your actual score/point system.
        // Get campaign IDs the user has joined
        $joinedCampaignIds = $user->campaignParticipants()->pluck('campaign_id');

        // Calculate total points earned from joined campaigns
        $totalPoints = $user->scores()->whereIn('campaign_id', $joinedCampaignIds)->sum('score_value');

        return response()->json([
            'total_posts' => $totalPosts,
            'campaigns_joined' => $campaignsJoined,
            'total_points' => $totalPoints,
            'social_media_accounts_count' => $user->socialMediaAccounts->count(),
        ]);
    }
}