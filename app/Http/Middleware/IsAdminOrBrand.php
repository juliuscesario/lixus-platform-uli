<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdminOrBrand
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && ($request->user()->hasRole('admin') || $request->user()->hasRole('brand'))) {
            return $next($request);
        }
        return response()->json(['message' => 'Unauthorized. Admin or Brand role required.'], 403);
    }
}