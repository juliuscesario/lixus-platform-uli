<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\InfluencerProfile; // Untuk update profil influencer
use App\Http\Resources\UserResource;

class UserController extends Controller
{
    /**
     * Display the authenticated user's profile.
     */
    public function showProfile(Request $request)
    {
        // Now public, so we need to check if a user is authenticated
        if (Auth::check()) {
            $user = $request->user();
            $user->load('role', 'influencerProfile', 'socialMediaAccounts');
            return response()->json([
                'user' => new UserResource($user)
            ]);
        }

        // If not authenticated, return a null user
        return response()->json(['user' => null]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
            // Tidak mengizinkan update password di sini, harus endpoint terpisah
            // Validasi untuk InfluencerProfile jika user adalah influencer
            'bio' => 'nullable|string',
            'follower_range' => 'nullable|string',
            'gender' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'city' => 'nullable|string',
            'contact_email' => 'nullable|email',
        ]);

        $user->update($request->only('name', 'email')); // Update data user

        // Jika user adalah influencer, update juga profilnya
        if ($user->isInfluencer()) {
            $influencerProfileData = $request->only([
                'bio', 'follower_range', 'gender', 'date_of_birth', 'city', 'contact_email'
            ]);
            // Gunakan updateOrCreate agar bisa update jika sudah ada atau buat jika belum
            $user->influencerProfile()->updateOrCreate(
                ['user_id' => $user->id], // Kriteria untuk mencari
                $influencerProfileData   // Data yang akan diupdate/dibuat
            );
        }

        $user->load('role', 'influencerProfile', 'socialMediaAccounts'); // Reload untuk data terbaru
        return response()->json([
            'user' => new UserResource($user)
        ]);
    }
}