<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserRole
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (empty($roles) || !in_array($user->role, $roles, true)) {
            return response()->json(['message' => 'Bạn không có quyền truy cập tài nguyên này.'], 403);
        }

        return $next($request);
    }
}