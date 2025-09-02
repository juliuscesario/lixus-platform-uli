<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\TikTokController; // We can keep the controller in the Api folder for now


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
Route::get('/padel-games', function () {
    return view('lixus-flow-padel-mini-game');
});

// --- TIKTOK CONNECTOR ROUTES ---
Route::middleware('auth')->prefix('social')->group(function () {
    Route::get('/tiktok/redirect', [TikTokController::class, 'redirectToTikTok'])->name('social.tiktok.redirect');
    // REMOVE THE DISCONNECT ROUTE FROM THIS FILE
});

Route::get('/social/tiktok/callback', [TikTokController::class, 'handleTikTokCallback'])->name('social.tiktok.callback');

// Your React catch-all route (this is correct)
Route::get('/{any?}', function () {
    return view('welcome');
})->where('any', '.*'); 