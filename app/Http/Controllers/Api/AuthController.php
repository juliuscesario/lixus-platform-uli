<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Handle user login using session-based authentication
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Use session-based authentication instead of tokens
        Auth::login($user, true); // Remember the user
        
        // Regenerate session to prevent session fixation
        $request->session()->regenerate();

        // Load relationships
        $user->load('role', 'influencerProfile', 'socialMediaAccounts');

        return response()->json([
            'message' => 'Login successful!',
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Handle user logout
     */
    public function logout(Request $request)
    {
        Auth::logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
    
    /**
     * Get the authenticated user
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        // Load the relationships needed by the frontend
        $user->load('role', 'influencerProfile', 'socialMediaAccounts');

        // Return the user data formatted by our UserResource
        return response()->json([
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Initialize CSRF cookie for SPA
     */
    public function sanctumCsrf()
    {
        return response()->json(['message' => 'CSRF cookie initialized']);
    }
}