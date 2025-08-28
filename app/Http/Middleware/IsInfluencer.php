<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsInfluencer
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->hasRole('influencer')) {
            return $next($request);
        }
        return response()->json(['message' => 'Unauthorized. Influencer role required.'], 403);
    }
}