<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string|array  $roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Check if user is authenticated
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        // Check if user's role matches any of the allowed roles
        if (!in_array($request->user()->role, $roles)) {
            return response()->json([
                'message' => 'Unauthorized. This action is only available to ' . implode(', ', $roles) . ' users.',
            ], 403);
        }

        return $next($request);
    }
}
