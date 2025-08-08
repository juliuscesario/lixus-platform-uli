<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User; // Mengacu pada model User karena influencer adalah User
use Illuminate\Http\Request;

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
                        })->with('influencerProfile')->get(); // eager load profile

        return response()->json($influencers);
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

        return response()->json($user);
    }

    // Metode untuk update profil influencer akan ada di UserController atau terpisah jika perlu
    // Contoh di UserController:
    // public function updateProfile(Request $request) { ... }
}