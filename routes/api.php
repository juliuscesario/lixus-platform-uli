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
});


// --- PROTECTED API ROUTES (Requires Sanctum Token) ---
Route::middleware('auth:sanctum')->group(function () {

    // --- Core Authenticated User Actions ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user/profile', [UserController::class, 'showProfile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);

    // Fallback for authenticated user info (standard Laravel Sanctum route)
    Route::get('/user', function (Request $request) {
        return $request->user()->load('role', 'influencerProfile');
    });


    // --- INFLUENCER SPECIFIC ROUTES ---
    Route::middleware('can:influencer')->group(function () {
        // Influencer Profile (for the authenticated influencer's own profile)
        Route::get('/influencer/profile', [InfluencerProfileController::class, 'showAuthenticatedInfluencerProfile']);
        Route::put('/influencer/profile', [InfluencerProfileController::class, 'updateAuthenticatedInfluencerProfile']);

        // Social Media Account Management
        // Menggunakan apiResource untuk CRUD dasar, lalu tambahkan custom
        Route::apiResource('social-media-accounts', SocialMediaAccountController::class);
        Route::post('/social-media-accounts/{social_media_account}/sync-posts', [SocialMediaAccountController::class, 'syncPosts']);

        // Campaign Actions for Influencer
        Route::get('/influencer/campaigns', [CampaignController::class, 'indexForInfluencer']); // Campaigns available to influencer
        Route::get('/influencer/campaigns/{campaign}', [CampaignController::class, 'showForInfluencer']); // Detail of a campaign for influencer
        Route::post('/influencer/campaigns/{campaign}/apply', [CampaignController::class, 'applyForCampaign']); // Influencer apply for a campaign
        Route::post('/influencer/campaigns/{campaign}/withdraw', [CampaignController::class, 'withdrawFromCampaign']); // Influencer withdraws (menggunakan nama method yang kita sepakati)

        // Post Management (for posts created by the authenticated influencer)
        // Sesuai roadmap 4.3 - 4.7
        Route::post('/my-posts', [PostController::class, 'store']); // 4.4 Menambahkan postingan baru
        Route::get('/my-posts', [PostController::class, 'index']); // 4.3 Daftar postingan Influencer terautentikasi
        Route::get('/my-posts/{post}', [PostController::class, 'show']); // 4.5 Detail postingan milik saya
        Route::put('/my-posts/{post}', [PostController::class, 'update']); // 4.6 Memperbarui postingan
        Route::delete('/my-posts/{post}', [PostController::class, 'destroy']); // 4.7 Menghapus postingan
        
        // NEW: Influencer dashboard stats route
        Route::get('/influencer/dashboard-stats/{user}', [InfluencerController::class, 'getInfluencerDashboardStats']);
    });


    // --- ADMIN / BRAND SPECIFIC ROUTES ---
    Route::middleware('can:admin_or_brand')->prefix('admin')->group(function () {
        // Campaign Management (Full CRUD for Admin/Brand)
        Route::apiResource('campaigns', CampaignController::class); // Meliputi index, store, show, update, destroy

        // Specific campaign actions for Admin/Brand
        Route::patch('campaigns/{campaign}/status', [CampaignController::class, 'updateStatus']); // Update campaign status
        Route::get('campaigns/{campaign}/participants', [CampaignController::class, 'getParticipants']); // Get participants for a campaign
        Route::patch('campaigns/{campaign}/participants/{user}/status', [CampaignController::class, 'updateParticipantStatus']); // Update participant status
        Route::get('campaigns/{campaign}/posts', [CampaignController::class, 'getCampaignPostsAdmin']); // Get posts for a campaign (Admin/Brand)

        // Post Management (Admin/Brand view and manage all posts)
        // Sesuai roadmap 4.8 - 4.11
        Route::get('/posts', [PostController::class, 'indexForAdmin']); // 4.8 Daftar semua postingan
        // Roadmap 4.9: Validasi postingan oleh Admin (Tetap untuk single post)
        Route::put('/posts/{post}', [PostController::class, 'validatePost']);

        // Roadmap 4.10: Hitung ulang skor untuk SEMUA postingan dalam kampanye tertentu
        Route::post('/campaigns/{campaign}/recalculate-scores', [PostController::class, 'recalculateAllCampaignScores']); // <-- ROUTE BARU

        // Roadmap 4.11: Mendapatkan metrik postingan (admin view) - tetap di PostController
        Route::get('/posts/{post}', [PostController::class, 'showAdminPost']);

        // Roadmap 4.12: Meminta metrik live untuk SEMUA postingan dalam kampanye tertentu
        Route::post('/campaigns/{campaign}/fetch-metrics', [PostController::class, 'fetchAllCampaignMetrics']); // <-- ROUTE BARU

        // Influencer Management (Admin/Brand view all influencers)h;
        Route::get('/influencers', [InfluencerController::class, 'indexAdmin']); // Admin/Brand can view all influencers
        Route::get('/influencers/{user}', [InfluencerController::class, 'showAdmin']); // <-- Anda mungkin ingin membuat showAdmin untuk detail influencer dari sisi admin

        // --- NEW REPORTING ROUTES ---
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/brand-performance', [ReportController::class, 'getBrandPerformanceReport'])->name('brand-performance');
            Route::get('/campaign-comparison', [ReportController::class, 'getCampaignComparisonReport'])->name('campaign-comparison');
            Route::get('/influencer-performance/{user}', [ReportController::class, 'getInfluencerPerformanceReport'])->name('influencer-performance');
        });
        // --- END OF NEW REPORTING ROUTES ---

        // NEW INFLUENCER APPLICATION MANAGEMENT ROUTES
        Route::get('/influencer-applications', [InfluencerApplicationController::class, 'index']);
        Route::get('/influencer-applications/{application}', [InfluencerApplicationController::class, 'show']);
        Route::post('/influencer-applications/{application}/approve', [InfluencerApplicationController::class, 'approve']);
        Route::post('/influencer-applications/{application}/reject', [InfluencerApplicationController::class, 'reject']);

    });
});