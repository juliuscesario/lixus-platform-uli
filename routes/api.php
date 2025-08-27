<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\SocialMediaController;
use App\Http\Controllers\Api\InfluencerController;
use App\Http\Controllers\Api\PostController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// === PUBLIC ROUTES (No Authentication Required) ===
Route::prefix('public')->group(function () {
    // Public Campaigns - Frontend expects these exact routes
    Route::get('/campaigns', [CampaignController::class, 'indexPublic']);
    Route::get('/campaigns/{campaign}', [CampaignController::class, 'showPublic']);
    Route::get('/campaigns/{campaign}/posts', [CampaignController::class, 'campaignPostsPublic']);
    
    // Public Influencers
    Route::get('/influencers', [InfluencerController::class, 'indexPublic']);
    Route::get('/influencers/{user}', [InfluencerController::class, 'showPublic']);
    
    // Public Posts
    Route::get('/posts', [PostController::class, 'indexPublic']);
    Route::get('/posts/{post}', [PostController::class, 'showPublic']);
    Route::get('/posts/campaign/{campaign}', [PostController::class, 'postsByCampaignPublic']);
    
    // Campaign Leaderboards
    Route::get('/campaigns/{campaign}/leaderboard', [CampaignController::class, 'getLeaderboardPublic']);
    
    // Registration (if you have public registration)
    Route::post('/register', [AuthController::class, 'register']);
});

// === AUTHENTICATION ROUTES ===
Route::post('/api/login', [AuthController::class, 'login']);

// === PROTECTED ROUTES (Session Authentication Required) ===
Route::middleware(['auth:web'])->group(function () {
    
    // Authentication Management
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // User Management
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::post('/upload', [UserController::class, 'uploadFile']);
    
    // Campaign Management (All authenticated users can view)
    Route::get('/campaigns', [CampaignController::class, 'index']);
    Route::get('/campaigns/{campaign}', [CampaignController::class, 'show']);
    Route::post('/campaigns/{campaign}/apply', [CampaignController::class, 'apply']);
    
    // Application Management
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::get('/applications/{application}', [ApplicationController::class, 'show']);
    Route::post('/applications', [ApplicationController::class, 'store']);
    Route::put('/applications/{application}/status', [ApplicationController::class, 'updateStatus']);
    
    // Social Media Management
    Route::get('/social-media-accounts', [SocialMediaController::class, 'index']);
    Route::post('/social-media-accounts/sync', [SocialMediaController::class, 'syncAccounts']);
    
    // Analytics
    Route::get('/analytics/{type}', [AnalyticsController::class, 'getData']);
    
    // === INFLUENCER-SPECIFIC ROUTES ===
    Route::prefix('influencer')->middleware(['role:influencer'])->group(function () {
        Route::get('/campaigns', [CampaignController::class, 'indexForInfluencer']); // Frontend expects this
        Route::post('/campaigns/{campaign}/apply', [CampaignController::class, 'applyForCampaign']);
        Route::post('/campaigns/{campaign}/withdraw', [CampaignController::class, 'withdrawFromCampaign']);
        Route::get('/dashboard-stats/{user}', [InfluencerController::class, 'getInfluencerDashboardStats']);
        
        // My Posts
        Route::get('/my-posts', [PostController::class, 'myPosts']);
        Route::post('/my-posts', [PostController::class, 'store']);
        Route::get('/my-posts/{post}', [PostController::class, 'showMyPost']);
        Route::put('/my-posts/{post}', [PostController::class, 'update']);
        Route::delete('/my-posts/{post}', [PostController::class, 'destroy']);
    });
    
    // === BRAND-SPECIFIC ROUTES ===
    Route::prefix('brand')->middleware(['role:brand'])->group(function () {
        Route::get('/campaigns', [CampaignController::class, 'indexForBrand']); // Frontend expects this
        Route::post('/campaigns', [CampaignController::class, 'store']);
        Route::put('/campaigns/{campaign}', [CampaignController::class, 'update']);
        Route::delete('/campaigns/{campaign}', [CampaignController::class, 'destroy']);
    });
    
    // === ADMIN-SPECIFIC ROUTES ===
    Route::prefix('admin')->middleware(['role:admin'])->group(function () {
        // Dashboard & Users
        Route::get('/dashboard', [AnalyticsController::class, 'adminDashboard']);
        Route::get('/users', [UserController::class, 'getAllUsers']);
        Route::put('/users/{user}/status', [UserController::class, 'updateUserStatus']);
        
        // Campaigns
        Route::get('/campaigns', [CampaignController::class, 'indexForAdmin']);
        Route::post('/campaigns', [CampaignController::class, 'store']);
        Route::get('/campaigns/{campaign}', [CampaignController::class, 'showForAdmin']);
        Route::put('/campaigns/{campaign}', [CampaignController::class, 'update']);
        Route::delete('/campaigns/{campaign}', [CampaignController::class, 'destroy']);
        Route::patch('/campaigns/{campaign}/status', [CampaignController::class, 'updateStatus']);
        
        // Campaign Management
        Route::get('/campaigns/{campaign}/participants', [CampaignController::class, 'getParticipants']);
        Route::patch('/campaigns/{campaign}/participants/{user}/status', [CampaignController::class, 'updateParticipantStatus']);
        Route::get('/campaigns/{campaign}/posts', [CampaignController::class, 'getCampaignPostsAdmin']);
        
        // Posts Management
        Route::get('/posts', [PostController::class, 'indexForAdmin']);
        Route::get('/posts/{post}', [PostController::class, 'showForAdmin']);
        Route::put('/posts/{post}', [PostController::class, 'validatePost']);
        
        // Reporting
        Route::prefix('reports')->group(function () {
            Route::get('/brand-performance', [AnalyticsController::class, 'getBrandPerformanceReport']);
            Route::get('/campaign-comparison', [AnalyticsController::class, 'getCampaignComparisonReport']);
            Route::get('/influencer-performance/{user}', [AnalyticsController::class, 'getInfluencerPerformanceReport']);
        });
        
        // Application Management
        Route::get('/applications', [ApplicationController::class, 'indexForAdmin']);
        Route::post('/applications/{application}/approve', [ApplicationController::class, 'approve']);
        Route::post('/applications/{application}/reject', [ApplicationController::class, 'reject']);
    });
});