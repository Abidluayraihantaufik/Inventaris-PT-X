<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveUser
{
    /**
     * Pastikan pengguna berstatus active (bukan pending/inactive).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->status === 'pending') {
            return response()->json([
                'message' => 'Akun Anda sedang menunggu persetujuan admin.',
            ], 403);
        }

        if ($user->status === 'inactive') {
            return response()->json([
                'message' => 'Akun Anda telah dinonaktifkan. Hubungi admin.',
            ], 403);
        }

        return $next($request);
    }
}
