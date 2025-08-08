<?php

use Illuminate\Support\Facades\Route;

// Arahkan semua request non-API ke view 'app'
// yang akan memuat aplikasi React Anda.
Route::get('/{any?}', function () {
    return view('welcome');
})->where('any', '.*');

// Route untuk API Anda akan tetap ada di routes/api.php