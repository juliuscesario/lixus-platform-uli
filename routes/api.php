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
Route::prefix('public')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/campaigns', [CampaignController::class, 'indexPublic']);
    Route::get('/campaigns/{campaign}', [CampaignController::class, 'showPublic']);
    Route::get('/campaigns/{campaign}/posts', [CampaignController::class, 'campaignPostsPublic']);
    Route::get('/influencers', [InfluencerController::class, 'index']);
    Route::get('/influencers/{user}', [InfluencerController::class, 'show'])->name('api.public.influencers.show');
    Route::get('/posts', [PostController::class, 'indexPublic']);
    Route::get('/posts/{post}', [PostController::class, 'showPublic']);
    Route::get('/posts/campaign/{campaign}', [PostController::class, 'ShowPublicbyCampaign']);
    Route::post('/influencer-applications', [InfluencerApplicationController::class, 'store']);
    Route::get('/campaigns/{campaign}/leaderboard', [CampaignController::class, 'getLeaderboard']);
});

// --- PROTECTED API ROUTES (Requires Sanctum Token) ---
Route::middleware('auth:sanctum')->group(function () {

     // ✅ ADD THE DISCONNECT ROUTE HERE
    Route::post('/social/tiktok/disconnect', [TikTokController::class, 'disconnectTikTok']);
    
    // --- Core Authenticated User Actions ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user/profile', [UserController::class, 'showProfile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::get('/user', function (Request $request) {
        return $request->user()->load('role', 'influencerProfile');
    });

    // --- INFLUENCER SPECIFIC ROUTES ---
    // ✅ FIX: Changed middleware from 'can:influencer' to the correct alias 'influencer'
    Route::middleware('influencer')->group(function () {
        Route::post('/influencer/campaigns/{campaign}/fetch-tiktok-videos', [TikTokController::class, 'fetchUserVideos']);
        Route::get('/influencer/profile', [InfluencerProfileController::class, 'showAuthenticatedInfluencerProfile']);
        Route::put('/influencer/profile', [InfluencerProfileController::class, 'updateAuthenticatedInfluencerProfile']);
        Route::apiResource('social-media-accounts', SocialMediaAccountController::class);
        Route::post('/social-media-accounts/{social_media_account}/sync-posts', [SocialMediaAccountController::class, 'syncPosts']);
        Route::get('/influencer/campaigns', [CampaignController::class, 'indexForInfluencer']);
        Route::get('/influencer/campaigns/{campaign}', [CampaignController::class, 'showForInfluencer']);
        Route::post('/influencer/campaigns/{campaign}/apply', [CampaignController::class, 'applyForCampaign']);
        Route::post('/influencer/campaigns/{campaign}/withdraw', [CampaignController::class, 'withdrawFromCampaign']);
        Route::post('/my-posts', [PostController::class, 'store']);
        Route::get('/my-posts', [PostController::class, 'index']);
        Route::get('/my-posts/{post}', [PostController::class, 'show']);
        Route::put('/my-posts/{post}', [PostController::class, 'update']);
        Route::delete('/my-posts/{post}', [PostController::class, 'destroy']);
        Route::get('/influencer/dashboard-stats/{user}', [InfluencerController::class, 'getInfluencerDashboardStats']);
    });

    // --- ADMIN / BRAND SPECIFIC ROUTES ---
    // ✅ FIX: Changed middleware from 'can:admin_or_brand' to the correct alias 'admin_or_brand'
    Route::middleware('admin_or_brand')->prefix('admin')->group(function () {
        Route::apiResource('campaigns', CampaignController::class);
        Route::patch('campaigns/{campaign}/status', [CampaignController::class, 'updateStatus']);
        Route::get('campaigns/{campaign}/participants', [CampaignController::class, 'getParticipants']);
        Route::patch('campaigns/{campaign}/participants/{user}/status', [CampaignController::class, 'updateParticipantStatus']);
        Route::get('campaigns/{campaign}/posts', [CampaignController::class, 'getCampaignPostsAdmin']);
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
});