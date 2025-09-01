<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = $request->header('X-Tenant-ID');

        if (! $tenantId) {
            // If you want to allow access for non-tenant routes, 
            // you can just 'return $next($request);' here.
            // For now, we'll assume tenant-specific routes require the header.
            return response()->json(['message' => 'Tenant ID is required.'], 400);
        }

        $tenant = Tenant::find($tenantId);

        if (! $tenant) {
            return response()->json(['message' => 'Tenant not found.'], 404);
        }
        
        // Set the current tenant for the application scope
        app()->singleton('tenant', function () use ($tenant) {
            return $tenant;
        });

        return $next($request);
    }
}