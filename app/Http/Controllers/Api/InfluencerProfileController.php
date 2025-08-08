<?php

namespace App\Http\Controllers\Api; // Pastikan namespace ini benar!

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\InfluencerProfile;
use App\Http\Resources\InfluencerProfileResource; // Import Resource yang baru dibuat
use App\Http\Resources\UserResource; // Import UserResource jika digunakan

class InfluencerProfileController extends Controller
{
    public function showAuthenticatedInfluencerProfile(Request $request)
    {
        $user = $request->user();

        // Pastikan Anda eager load 'influencerProfile' jika ingin menyertakan data user dari relasi
        $user->load('influencerProfile'); 

        if ($user->influencerProfile) {
            return response()->json([
                'status' => 'success',
                'message' => 'Influencer profile retrieved successfully',
                'data' => new InfluencerProfileResource($user->influencerProfile) // Gunakan Resource di sini
            ], 200);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Influencer profile not found for this user.'
        ], 404);
    }

    public function updateAuthenticatedInfluencerProfile(Request $request)
    {
        // Pastikan validasi dilakukan dengan benar.
        // Laravel secara otomatis akan mengembalikan 422 JSON jika validasi gagal
        // untuk permintaan yang memiliki Accept: application/json header.
        $validatedData = $request->validate([
            'bio' => 'nullable|string|max:1000',
            'follower_range' => 'nullable|string|in:Nano,Micro,Mid,Macro,Mega',
            'gender' => 'nullable|string|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'city' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            // Pastikan tidak ada field yang wajib di sini yang tidak dikirim atau null
            // Misalnya, 'contact_email' di body Anda bernilai 'maga@maga.com', itu ok.
        ]);

        $user = $request->user();
        $profile = $user->influencerProfile;

        // Pastikan profil ditemukan sebelum mencoba update
        if (!$profile) {
            return response()->json([
                'status' => 'error',
                'message' => 'No influencer profile found to update for this user.'
            ], 404); // Status 404 jika profil tidak ditemukan
        }

        // Update profil
        $profile->update($validatedData);

        // Mengembalikan respons JSON yang benar
        return response()->json([
            'status' => 'success',
            'message' => 'Influencer profile updated successfully.',
            'data' => new InfluencerProfileResource($profile->fresh()) // Gunakan fresh() untuk mendapatkan data terbaru dari DB
        ], 200); // Status 200 OK untuk update berhasil
    }
    
    // ... metode showPublic jika ada
}