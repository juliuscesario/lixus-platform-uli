<?php
// app/Http/Controllers/Api/AuthController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
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

        // Clear any existing tokens for this user to prevent token pollution
        $user->tokens()->delete();
        
        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;
        
        // If using session-based auth, also login the user
        if ($request->hasSession()) {
            Auth::login($user);
            $request->session()->regenerate(); // Regenerate session ID for security
        }

        return response()->json([
            'message' => 'Login successful',
            'user' => new UserResource($user),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Handle user logout with complete session cleanup
     */
    public function logout(Request $request)
    {
        try {
            // Delete the current access token if it exists
            if ($request->user()) {
                // Delete current token
                $currentToken = $request->user()->currentAccessToken();
                if ($currentToken && method_exists($currentToken, 'delete')) {
                    $currentToken->delete();
                }
                
                // Optionally, delete all tokens for complete logout from all devices
                // Uncomment the line below if you want to logout from all devices
                // $request->user()->tokens()->delete();
            }
            
            // Handle session-based logout
            if ($request->hasSession()) {
                // Clear the session
                $request->session()->invalidate();
                
                // Regenerate the CSRF token
                $request->session()->regenerateToken();
                
                // Logout from Auth guard
                Auth::guard('web')->logout();
            }
            
            // Clear any remember me cookies
            if ($request->hasCookie('remember_web')) {
                \Cookie::queue(\Cookie::forget('remember_web'));
            }
            
            return response()->json([
                'message' => 'Logged out successfully'
            ], 200);
            
        } catch (\Exception $e) {
            // Log the error but still return success
            \Log::error('Logout error: ' . $e->getMessage());
            
            // Even if there's an error, ensure session is cleared
            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }
            
            return response()->json([
                'message' => 'Logged out successfully'
            ], 200);
        }
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request)
    {
        return response()->json(new UserResource($request->user()));
    }

    /**
     * Register new user
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Create token for new user
        $token = $user->createToken('auth-token')->plainTextToken;
        
        // If using session-based auth, also login the user
        if ($request->hasSession()) {
            Auth::login($user);
            $request->session()->regenerate();
        }

        return response()->json([
            'message' => 'Registration successful',
            'user' => new UserResource($user),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }
    
    /**
     * Refresh user session/token
     */
    public function refresh(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        // Delete old token and create new one
        if ($user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }
        
        $token = $user->createToken('auth-token')->plainTextToken;
        
        // Regenerate session if using session-based auth
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }
        
        return response()->json([
            'user' => new UserResource($user),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }
}