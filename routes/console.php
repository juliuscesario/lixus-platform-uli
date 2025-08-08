<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule; // Pastikan ini di-use

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// --- Definisi Jadwal Tugas (Scheduled Tasks) ---
// Tambahkan perintah sanctum:prune-expired di sini
Schedule::command('sanctum:prune-expired --hours=24')->daily(); // Menghapus token yang kedaluwarsa setiap hari
// Anda bisa menyesuaikan --hours (misal: --hours=168 untuk 7 hari)
// Atau bisa juga lebih sering, misal: ->hourly()

// Contoh scheduled task lainnya:
// Schedule::call(function () {
//     // Logika tugas kustom
// })->daily();