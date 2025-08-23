<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SocialAuthController; // <-- ADD THIS LINE

// Add this new route for the Gaung landing page
Route::get('/', function () {
    return view('lixus-flow-landing');
});
// Add this new route for the Gaung landing page
Route::get('/communities', function () {
    return view('lixus-flow-community');
});
// Add this new route for the Gaung landing page
Route::get('/terms-of-service', function () {
    return view('lixus-flow-terms-of-service');
});
// Add this new route for the Gaung landing page
Route::get('/privacy-policy', function () {
    return view('lixus-flow-privacy-policy');
});

// Add this new route for the Gaung landing page
Route::get('/mini-game-padel', function () {
    return view('lixus-flow-padel');
});
// Arahkan semua request non-API ke view 'app'

// --- TIKTOK CALLBACK ROUTE HERE ---
Route::get('/social/tiktok/callback', [SocialAuthController::class, 'handleTikTokCallback'])->name('social.tiktok.callback');

// yang akan memuat aplikasi React Anda.
Route::get('/{any?}', function () {
    return view('welcome');
})->where('any', '.*');

// Route untuk API Anda akan tetap ada di routes/api.php