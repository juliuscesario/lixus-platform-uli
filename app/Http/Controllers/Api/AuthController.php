<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
// Import the new request classes
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user login
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        // Attempt to authenticate using session
        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();
        
        // Create a new token for API access
        $token = $user->createToken('auth-token')->plainTextToken;

        // Load relationships
        $user->load('role', 'influencerProfile', 'socialMediaAccounts');

        // Regenerate session to prevent session fixation
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login successful!',
            'user' => new UserResource($user),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Handle user registration
     */
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        // Create the user
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Assign default role (you might want to customize this)
        $user->assignRole('user'); // Assuming you have a default 'user' role

        // Log the user in
        Auth::login($user);

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Load relationships
        $user->load('role', 'influencerProfile', 'socialMediaAccounts');

        // Regenerate session
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Registration successful!',
            'user' => new UserResource($user),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Handle user logout
     */
    public function logout(Request $request)
    {
        // Revoke all tokens for the user
        if ($request->user()) {
            // Delete all tokens
            $request->user()->tokens()->delete();
        }

        // Logout from session
        Auth::guard('web')->logout();

        // Invalidate session
        $request->session()->invalidate();
        
        // Regenerate CSRF token
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

        // Load relationships
        $user->load('role', 'influencerProfile', 'socialMediaAccounts');

        return new UserResource($user);
    }

    /**
     * Refresh the user's authentication token
     */
    public function refresh(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        // Delete old tokens
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Load relationships
        $user->load('role', 'influencerProfile', 'socialMediaAccounts');

        return response()->json([
            'message' => 'Token refreshed successfully',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Verify if the user's session is still valid
     */
    public function verify(Request $request)
    {
        // This endpoint is used to check if the user's session/token is still valid
        // It's called when the app loads to verify stored credentials
        
        if (!$request->user()) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid or expired session'
            ], 401);
        }

        return response()->json([
            'valid' => true,
            'message' => 'Session is valid'
        ]);
    }
}