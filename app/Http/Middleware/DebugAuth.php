<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class DebugAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Log URL permintaan
        Log::info('DebugAuth Middleware: Request URL: ' . $request->fullUrl());
        // Log ID sesi saat ini
        Log::info('DebugAuth Middleware: Session ID: ' . $request->session()->getId());
        // Periksa apakah ada user di sesi untuk guard default (biasanya 'web')
        Log::info('DebugAuth Middleware: Has session user: ' . ($request->session()->has('login_web_'.Auth::getDefaultDriver()) ? 'Yes' : 'No'));
        // Periksa status otentikasi saat ini
        Log::info('DebugAuth Middleware: Is authenticated: ' . (Auth::check() ? 'Yes' : 'No'));

        // Jika user tidak terotentikasi, log peringatan
        if (!Auth::check()) {
            Log::warning('DebugAuth Middleware: User is NOT authenticated for ' . $request->fullUrl() . '. Redirecting...');
        } else {
            // Jika user terotentikasi, log email user
            Log::info('DebugAuth Middleware: User IS authenticated: ' . Auth::user()->email);
        }

        return $next($request); // Lanjutkan permintaan ke handler berikutnya
    }
}
