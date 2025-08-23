<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate; // <-- Tambahkan baris ini
use App\Models\User; // <-- Pastikan model User diimport
use App\Models\Role; // <-- Jika model Role digunakan untuk mengecek nama role


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //// --- Definisi Gates untuk Otorisasi Peran ---

        // Gate untuk peran "admin"
        Gate::define('admin', function (User $user) {
            // Asumsi ada relasi 'role' pada model User dan kolom 'name' pada model Role
            return $user->role && $user->role->name === 'admin';
        });

        // Gate untuk peran "influencer"
        Gate::define('influencer', function (User $user) {
            return $user->role && $user->role->name === 'influencer';
        });

        // Gate untuk peran "brand" (jika ada)
        Gate::define('brand', function (User $user) {
            return $user->role && $user->role->name === 'brand';
        });

        // Gate untuk peran "admin" atau "brand"
        Gate::define('admin_or_brand', function (User $user) {
            return $user->role && ($user->role->name === 'admin' || $user->role->name === 'brand');
        });

        // --- END Definisi Gates ---
    }
}
