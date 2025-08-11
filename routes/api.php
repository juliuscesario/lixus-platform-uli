<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\InfluencerController;
use App\Http\Controllers\Api\InfluencerProfileController;
use App\Http\Controllers\Api\PostController; // Pastikan ini diimpor
use App\Http\Controllers\Api\SocialMediaAccountController;
use App\Http\Controllers\Api\UserController;
// --- 1. IMPORT THE NEW CONTROLLER ---
use App\Http\Controllers\Api\ReportController;
// --- 2. IMPORT THE NEW CONTROLLER APPLICATION ---
use App\Http\Controllers\Api\InfluencerApplicationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// --- PUBLIC API ROUTES ---
Route::prefix('public')->group(function () {
    // Auth (Registration & Login)
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Campaigns (Publicly viewable)
    Route::get('/campaigns', [CampaignController::class, 'indexPublic']);
    Route::get('/campaigns/{campaign}', [CampaignController::class, 'showPublic']);
    Route::get('/campaigns/{campaign}/posts', [CampaignController::class, 'campaignPostsPublic']);

    // Influencers & Posts (Publicly viewable data)
    Route::get('/influencers', [InfluencerController::class, 'index']); // Daftar influencer publik
    Route::get('/influencers/{user}', [InfluencerController::class, 'show'])->name('api.public.influencers.show'); // Detail influencer publik (pastikan ini menggunakan User UUID)

    // Posts (Publicly viewable, general feed)
    Route::get('/posts', [PostController::class, 'indexPublic']); // <-- Method ini perlu dibuat di PostController
    Route::get('/posts/{post}', [PostController::class, 'showPublic']); // <-- Method ini perlu dibuat di PostController
    Route::get('/posts/campaign/{campaign}', [PostController::class, 'ShowPublicbyCampaign']); // <-- Method ini perlu dibuat di PostController
    
    // NEW INFLUENCER APPLICATION ROUTE
    Route::post('/influencer-applications', [InfluencerApplicationController::class, 'store']);

    // Roadmap 4.13: Get Leaderboard for a specific campaign
    Route::get('/campaigns/{campaign}/leaderboard', [CampaignController::class, 'getLeaderboard']);
    
    // --- User Profile (Publicly accessible to check auth status) ---
    Route::get('/user/profile', [UserController::class, 'showProfile']);
});


// --- PROTECTED API ROUTES (Requires Sanctum Token) ---
Route::middleware('auth:sanctum')->group(function () {
    // --- Core Authenticated User Actions ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);

    // Fallback for authenticated user info (standard Laravel Sanctum route)
    Route::get('/user', function (Request $request) {
        return $request->user()->load('role', 'influencerProfile');
    });


    // --- INFLUENCER SPECIFIC ROUTES ---
    Route::prefix('admin')->middleware('admin')->group(function () {
        // Campaign Management
        Route::apiResource('campaigns', CampaignController::class);
        Route::patch('campaigns/{campaign}/status', [CampaignController::class, 'updateStatus']);
        Route::get('campaigns/{campaign}/participants', [CampaignController::class, 'getParticipants']);
        Route::patch('campaigns/{campaign}/participants/{user}/status', [CampaignController::class, 'updateParticipantStatus']);
        Route::post('/campaigns/{campaign}/recalculate-scores', [PostController::class, 'recalculateAllCampaignScores']);
        Route::post('/campaigns/{campaign}/fetch-metrics', [PostController::class, 'fetchAllCampaignMetrics']);

        // Post Management
        Route::get('/posts', [PostController::class, 'indexForAdmin']);
        Route::put('/posts/{post}', [PostController::class, 'validatePost']);
        Route::get('/posts/{post}', [PostController::class, 'showAdminPost']);

        // Influencer Management
        Route::get('/influencers', [InfluencerController::class, 'indexAdmin']);
        Route::get('/influencers/{user}', [InfluencerController::class, 'showAdmin']);

        // Reporting
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/brand-performance', [ReportController::class, 'getBrandPerformanceReport'])->name('brand-performance');
            Route::get('/campaign-comparison', [ReportController::class, 'getCampaignComparisonReport'])->name('campaign-comparison');
            Route::get('/influencer-performance/{user}', [ReportController::class, 'getInfluencerPerformanceReport'])->name('influencer-performance');
        });

        // Influencer Applications
        Route::get('/influencer-applications', [InfluencerApplicationController::class, 'index']);
        Route::get('/influencer-applications/{application}', [InfluencerApplicationController::class, 'show']);
        Route::post('/influencer-applications/{application}/approve', [InfluencerApplicationController::class, 'approve']);
        Route::post('/influencer-applications/{application}/reject', [InfluencerApplicationController::class, 'reject']);
    });

    Route::prefix('brand')->middleware('can:brand')->group(function () {
        // Campaign Management
        Route::apiResource('campaigns', CampaignController::class)->only(['index', 'show', 'store', 'update']);
        Route::patch('campaigns/{campaign}/status', [CampaignController::class, 'updateStatus']);
        Route::get('campaigns/{campaign}/participants', [CampaignController::class, 'getParticipants']);
        Route::patch('campaigns/{campaign}/participants/{user}/status', [CampaignController::class, 'updateParticipantStatus']);
    });

    Route::prefix('influencer')->middleware('can:influencer')->group(function () {
        // Profile
        Route::get('/profile', [InfluencerProfileController::class, 'showAuthenticatedInfluencerProfile']);
        Route::put('/profile', [InfluencerProfileController::class, 'updateAuthenticatedInfluencerProfile']);

        // social media
        Route::apiResource('social-media-accounts', SocialMediaAccountController::class);
        Route::post('/social-media-accounts/{social_media_account}/sync-posts', [SocialMediaAccountController::class, 'syncPosts']);

        // Campaigns
        Route::get('/campaigns', [CampaignController::class, 'indexForInfluencer']);
        Route::get('/campaigns/{campaign}', [CampaignController::class, 'showForInfluencer']);
        Route::post('/campaigns/{campaign}/apply', [CampaignController::class, 'applyForCampaign']);
        Route::post('/campaigns/{campaign}/withdraw', [CampaignController::class, 'withdrawApplication']);

        // Posts
        Route::apiResource('my-posts', PostController::class)->except(['index', 'show', 'update', 'destroy']);
        Route::get('/my-posts', [PostController::class, 'index']);
        Route::get('/my-posts/{post}', [PostController::class, 'show']);
        Route::put('/my-posts/{post}', [PostController::class, 'update']);
        Route::delete('/my-posts/{post}', [PostController::class, 'destroy']);
    });
});