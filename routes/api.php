<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\InfluencerApplicationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SocialMediaAccountController;
use App\Http\Controllers\Api\ContentSubmissionController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes (no authentication required)
Route::prefix('public')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/influencer-applications', [InfluencerApplicationController::class, 'apply']);
    
    // Public campaign endpoints
    Route::get('/campaigns', [CampaignController::class, 'publicIndex']);
    Route::get('/campaigns/{campaign}', [CampaignController::class, 'publicShow']);
});

// Routes that require authentication (using Sanctum)
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Authentication endpoints
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/verify', [AuthController::class, 'verify']);
    
    // Profile endpoints
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
    
    // Social media account endpoints
    Route::get('/social-accounts', [SocialMediaAccountController::class, 'index']);
    Route::post('/social-accounts/connect', [SocialMediaAccountController::class, 'connect']);
    Route::delete('/social-accounts/{account}/disconnect', [SocialMediaAccountController::class, 'disconnect']);
    Route::post('/social-accounts/{account}/verify', [SocialMediaAccountController::class, 'verify']);
    
    // Campaign endpoints (authenticated users)
    Route::get('/campaigns', [CampaignController::class, 'index']);
    Route::get('/campaigns/{campaign}', [CampaignController::class, 'show']);
    Route::get('/campaigns/{campaign}/participants', [CampaignController::class, 'participants']);
    Route::get('/campaigns/{campaign}/submissions', [CampaignController::class, 'submissions']);
    Route::get('/campaigns/{campaign}/leaderboard', [LeaderboardController::class, 'show']);
    
    // Campaign participation (influencers only)
    Route::middleware(['role:influencer'])->group(function () {
        Route::post('/campaigns/{campaign}/join', [CampaignController::class, 'join']);
        Route::post('/campaigns/{campaign}/leave', [CampaignController::class, 'leave']);
        Route::post('/campaigns/{campaign}/submit', [ContentSubmissionController::class, 'submit']);
        Route::get('/my-submissions', [ContentSubmissionController::class, 'mySubmissions']);
        Route::get('/my-campaigns', [CampaignController::class, 'myCampaigns']);
    });
    
    // Campaign management (brands only)
    Route::middleware(['role:brand'])->group(function () {
        Route::post('/campaigns', [CampaignController::class, 'store']);
        Route::put('/campaigns/{campaign}', [CampaignController::class, 'update']);
        Route::delete('/campaigns/{campaign}', [CampaignController::class, 'destroy']);
        Route::post('/campaigns/{campaign}/invite', [CampaignController::class, 'inviteInfluencers']);
        Route::post('/campaigns/{campaign}/submissions/{submission}/approve', [ContentSubmissionController::class, 'approve']);
        Route::post('/campaigns/{campaign}/submissions/{submission}/reject', [ContentSubmissionController::class, 'reject']);
    });
    
    // Notification endpoints
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    
    // Admin routes
    Route::middleware(['role:admin'])->prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard-stats', [AdminController::class, 'dashboardStats']);
        
        // User management
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/users/{user}', [AdminController::class, 'showUser']);
        Route::put('/users/{user}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
        Route::post('/users/{user}/suspend', [AdminController::class, 'suspendUser']);
        Route::post('/users/{user}/unsuspend', [AdminController::class, 'unsuspendUser']);
        
        // Influencer application management
        Route::get('/influencer-applications', [InfluencerApplicationController::class, 'index']);
        Route::get('/influencer-applications/{application}', [InfluencerApplicationController::class, 'show']);
        Route::post('/influencer-applications/{application}/approve', [InfluencerApplicationController::class, 'approve']);
        Route::post('/influencer-applications/{application}/reject', [InfluencerApplicationController::class, 'reject']);
        
        // Campaign management
        Route::get('/campaigns', [AdminController::class, 'campaigns']);
        Route::post('/campaigns/{campaign}/approve', [AdminController::class, 'approveCampaign']);
        Route::post('/campaigns/{campaign}/reject', [AdminController::class, 'rejectCampaign']);
        Route::post('/campaigns/{campaign}/suspend', [AdminController::class, 'suspendCampaign']);
        
        // Content moderation
        Route::get('/content-submissions', [AdminController::class, 'contentSubmissions']);
        Route::post('/content-submissions/{submission}/flag', [AdminController::class, 'flagContent']);
        Route::post('/content-submissions/{submission}/unflag', [AdminController::class, 'unflagContent']);
        
        // Reports and analytics
        Route::get('/reports/overview', [AdminController::class, 'overviewReport']);
        Route::get('/reports/campaigns', [AdminController::class, 'campaignsReport']);
        Route::get('/reports/influencers', [AdminController::class, 'influencersReport']);
        Route::get('/reports/brands', [AdminController::class, 'brandsReport']);
    });
    
    // Search endpoint
    Route::get('/search', [SearchController::class, 'search']);
});

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ]);
});