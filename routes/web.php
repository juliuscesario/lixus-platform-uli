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

// --- TIKTOK CONNECTOR ROUTES ---
// The 'auth' middleware ensures that only logged-in users can connect their accounts.
Route::middleware('auth')->prefix('social')->group(function () {
    Route::get('/tiktok/redirect', [TikTokController::class, 'redirectToTikTok'])->name('social.tiktok.redirect');
    // ADD THIS NEW ROUTE FOR DISCONNECTING
    Route::post('/tiktok/disconnect', [TikTokController::class, 'disconnectTikTok'])->name('social.tiktok.disconnect');
    // ADD THIS NEW ROUTE
    Route::get('/me', [AuthController::class, 'me']);

});

Route::get('/social/tiktok/callback', [TikTokController::class, 'handleTikTokCallback'])->name('social.tiktok.callback');


// Arahkan semua request non-API ke view 'app'
// yang akan memuat aplikasi React Anda.
Route::get('/{any?}', function () {
    return view('welcome');
})->where('any', '.*');

// Route untuk API Anda akan tetap ada di routes/api.php