<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Role; // Kita perlu Role model untuk assign role
use App\Http\Resources\UserResource;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Dapatkan role_id untuk 'influencer' secara default
        $influencerRole = Role::where('name', 'influencer')->first();

        if (!$influencerRole) {
            return response()->json(['message' => 'Influencer role not found. Please run seeder.'], 500);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $influencerRole->id, // Default to influencer
        ]);

        // Autentikasi user dan buat token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful!',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;
        
        // Load relationships for UserResource
        $user->load('role', 'influencerProfile');

        return response()->json([
            'message' => 'Login successful!',
            'user' => new UserResource($user),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        // Check if the user has a current access token (for API token authentication)
        if ($request->user()->currentAccessToken()) {
            // Only delete if it's a real PersonalAccessToken, not a TransientToken
            if (method_exists($request->user()->currentAccessToken(), 'delete')) {
                $request->user()->currentAccessToken()->delete();
            }
        }
        
        // For SPA authentication, we should also invalidate the session
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => 'Logged out successfully.'
        ]);
    }
}