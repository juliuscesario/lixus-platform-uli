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
        // Konfigurasi untuk middleware API group
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);

        // Konfigurasi untuk middleware WEB group
        $middleware->web(append: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'api/public/*',
        ]);

        // Alias middleware (seperti 'auth:sanctum', atau custom 'role')
        $middleware->alias([
            'auth:sanctum' => \Laravel\Sanctum\Http\Middleware\AuthenticateWithSanctum::class,
            'debug.auth' => \App\Http\Middleware\DebugAuth::class, // <-- TAMBAHKAN BARIS INI
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
