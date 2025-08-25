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
        $middleware->trustProxies(at: '*');

        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->web(append: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'api/public/*',
        ]);

        // ✅ FIX: Define simple, direct aliases for the role middleware.
        $middleware->alias([
            'admin' => \App\Http\Middleware\IsAdmin::class,
            'influencer' => \App\Http\Middleware\IsInfluencer::class,
            'admin_or_brand' => \App\Http\Middleware\IsAdminOrBrand::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Exception handling can be configured here
    })->create();