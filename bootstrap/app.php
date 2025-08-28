<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // ✅ THIS IS THE ONLY LINE YOU NEED FOR SANCTUM SESSIONS
        // It correctly applies the stateful API middleware.
        $middleware->statefulApi(); 

        // This is fine, especially if you are behind a load balancer.
        $middleware->trustProxies(at: '*');

        // This is also correct.
        $middleware->validateCsrfTokens(except: [
            'api/public/*',
            'api/login'
        ]);

        // Your role aliases are correct.
        $middleware->alias([
            'admin' => \App\Http\Middleware\IsAdmin::class,
            'influencer' => \App\Http\Middleware\IsInfluencer::class,
            'admin_or_brand' => \App\Http\Middleware\IsAdminOrBrand::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Exception handling can be configured here
    })
    // ✅ FIX: Use the full namespace directly in the type hint
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        $schedule->command('app:sync-campaign-posts')->everyFifteenMinutes();
    })->create();