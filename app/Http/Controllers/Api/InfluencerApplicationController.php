<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InfluencerApplication;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use App\Services\EmailService;

class InfluencerApplicationController extends Controller
{
    /**
     * [Public] Store a new influencer application.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:influencer_applications,email|unique:users,email',
            'gender' => 'nullable|string|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'city' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:2000',
            'social_media_profiles' => 'required|array|min:1',
            'social_media_profiles.*.platform' => 'required|string|in:instagram,tiktok,youtube,facebook',
            'social_media_profiles.*.username' => 'required|string',
            'social_media_profiles.*.followers' => 'required|integer|min:0',
        ]);

        $application = InfluencerApplication::create($validatedData);

        return response()->json([
            'message' => 'Your application has been submitted successfully!',
            'data' => $application,
        ], 201);
    }

    /**
     * [Admin/Brand] Get a list of influencer applications.
     */
    public function index(Request $request)
    {
        $request->validate([
            'status' => ['nullable', 'string', Rule::in(['pending', 'approved', 'rejected'])],
        ]);

        $applications = InfluencerApplication::query()
            ->when($request->status, fn ($query, $status) => $query->where('status', $status))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($applications);
    }

    /**
     * [Admin/Brand] Get a single influencer application.
     */
    public function show(InfluencerApplication $application)
    {
        return response()->json($application);
    }

    /**
     * [Admin/Brand] Approve an influencer application and create a user account.
     */
    public function approve(Request $request, InfluencerApplication $application, EmailService $emailService)
    {
        if ($application->status === 'approved') {
            return response()->json(['message' => 'This application has already been approved.'], 409);
        }

        $influencerRole = Role::where('name', 'influencer')->firstOrFail();
        $password = Str::random(10); // Generate a random password

        DB::beginTransaction();
        try {
            // 1. Create User
            $user = User::create([
                'name' => $application->name,
                'email' => $application->email,
                'password' => Hash::make($password),
                'role_id' => $influencerRole->id,
                'email_verified_at' => now(), // Auto-verify email on approval
            ]);

            // 2. Create Influencer Profile
            $user->influencerProfile()->create([
                'bio' => $application->bio,
                'gender' => $application->gender,
                'date_of_birth' => $application->date_of_birth,
                'city' => $application->city,
                'contact_email' => $application->email,
                // Extract follower range from social profiles
                'follower_range' => $this->determineFollowerRange(collect($application->social_media_profiles)->sum('followers')),
            ]);

            // 3. Update Application Status
            $application->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
            ]);

            DB::commit();

            // Send the welcome email with the generated password.
            $emailService->sendInfluencerWelcomeEmail($user, $password);

            return response()->json([
                'message' => 'Influencer application approved successfully. User account has been created and a welcome email has been sent.',
                'user' => $user->load('influencerProfile'),
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to approve application.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * [Admin/Brand] Reject an influencer application.
     */
    public function reject(Request $request, InfluencerApplication $application)
    {
        if ($application->status !== 'pending') {
            return response()->json(['message' => 'Only pending applications can be rejected.'], 409);
        }

        $request->validate(['rejection_reason' => 'required|string|max:1000']);

        $application->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
        ]);

        return response()->json(['message' => 'Application has been rejected.']);
    }

    /**
     * Helper to determine follower range.
     */
    private function determineFollowerRange(int $followers): string
    {
        if ($followers < 10000) return 'Nano';
        if ($followers < 100000) return 'Micro';
        if ($followers < 500000) return 'Mid';
        if ($followers < 1000000) return 'Macro';
        return 'Mega';
    }
}