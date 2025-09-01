<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\InfluencerController;
use App\Http\Controllers\Api\InfluencerProfileController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\SocialMediaAccountController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\InfluencerApplicationController;
use App\Http\Controllers\Api\TikTokController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- PUBLIC API ROUTES ---
// These routes are accessible without authentication and are not tenant-specific.
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/influencer-applications', [InfluencerApplicationController::class, 'store']);


// --- PROTECTED, TENANT-AWARE API ROUTES ---
// All routes in this group require authentication AND the X-Tenant-ID header.
Route::middleware(['auth:sanctum', 'tenant'])->group(function () {
    
    // --- Core Authenticated User Actions ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        // The user is automatically associated with the current tenant
        return $request->user()->load('role', 'influencerProfile', 'tenant');
    });

    // --- ADMIN / BRAND SPECIFIC ROUTES ---
    // These routes are for users with 'admin' or 'brand' roles within a tenant.
    Route::middleware('admin_or_brand')->prefix('admin')->group(function () {
        Route::apiResource('campaigns', CampaignController::class);
        Route::patch('campaigns/{campaign}/status', [CampaignController::class, 'updateStatus']);
        Route::get('campaigns/{campaign}/participants', [CampaignController::class, 'getParticipants']);
        Route::patch('campaigns/{campaign}/participants/{user}/status', [CampaignController::class, 'updateParticipantStatus']);
        Route::get('campaigns/{campaign}/posts', [CampaignController::class, 'getCampaignPostsAdmin']);
        Route::get('campaigns/{campaign}/leaderboard', [CampaignController::class, 'getLeaderboard']);
        
        Route::get('/posts', [PostController::class, 'indexForAdmin']);
        Route::put('/posts/{post}', [PostController::class, 'validatePost']);
        Route::post('/campaigns/{campaign}/recalculate-scores', [PostController::class, 'recalculateAllCampaignScores']);
        Route::get('/posts/{post}', [PostController::class, 'showAdminPost']);
        Route::post('/campaigns/{campaign}/fetch-metrics', [PostController::class, 'fetchAllCampaignMetrics']);
        
        Route::get('/influencers', [InfluencerController::class, 'indexAdmin']);
        Route::get('/influencers/{user}', [InfluencerController::class, 'showAdmin']);

        // Reporting Routes
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/brand-performance', [ReportController::class, 'getBrandPerformanceReport'])->name('brand-performance');
            Route::get('/campaign-comparison', [ReportController::class, 'getCampaignComparisonReport'])->name('campaign-comparison');
            Route::get('/influencer-performance/{user}', [ReportController::class, 'getInfluencerPerformanceReport'])->name('influencer-performance');
        });

        // Influencer Application Management
        Route::get('/influencer-applications', [InfluencerApplicationController::class, 'index']);
        Route::get('/influencer-applications/{application}', [InfluencerApplicationController::class, 'show']);
        Route::post('/influencer-applications/{application}/approve', [InfluencerApplicationController::class, 'approve']);
        Route::post('/influencer-applications/{application}/reject', [InfluencerApplicationController::class, 'reject']);
    });

    // --- INFLUENCER SPECIFIC ROUTES ---
    // These routes are for users with the 'influencer' role within a tenant.
    Route::middleware('isInfluencer')->prefix('influencer')->group(function () {
        // Profile & Account Management
        Route::get('/profile', [InfluencerProfileController::class, 'showAuthenticatedInfluencerProfile']);
        Route::put('/profile', [InfluencerProfileController::class, 'updateAuthenticatedInfluencerProfile']);
        Route::apiResource('social-media-accounts', SocialMediaAccountController::class)->except(['store', 'update']); // Assuming creation/update handled elsewhere
        Route::post('/social/tiktok/disconnect', [TikTokController::class, 'disconnectTikTok']);

        // Campaign Interaction
        Route::get('/campaigns', [CampaignController::class, 'indexForInfluencer']);
        Route::get('/campaigns/{campaign}', [CampaignController::class, 'showForInfluencer']);
        Route::post('/campaigns/{campaign}/apply', [CampaignController::class, 'applyForCampaign']);
        Route::post('/campaigns/{campaign}/withdraw', [CampaignController::class, 'withdrawFromCampaign']);

        // Post Management
        Route::apiResource('posts', PostController::class)->names('influencer.posts');
        
        // TikTok Integration
        Route::post('/campaigns/{campaign}/fetch-tiktok-videos', [TikTokController::class, 'fetchUserVideos']);

        // Dashboard
        Route::get('/dashboard-stats', [InfluencerController::class, 'getInfluencerDashboardStats']);
    });
});