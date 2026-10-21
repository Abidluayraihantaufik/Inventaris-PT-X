<?php

use App\Http\Middleware\EnsureActiveUser;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Daftarkan alias middleware custom
        $middleware->alias([
            'admin'       => EnsureAdmin::class,
            'active.user' => EnsureActiveUser::class,
        ]);

        // Tambahkan header CORS untuk frontend (React di localhost:5173)
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Kembalikan semua error sebagai JSON untuk API request
        $exceptions->render(function (\Exception $e, Request $request) {
            if ($request->is('api/*')) {
                if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    return response()->json(['message' => 'Unauthenticated. Silakan login terlebih dahulu.'], 401);
                }
                if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                    return response()->json(['message' => 'Data tidak ditemukan.'], 404);
                }
                if ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
                    return response()->json(['message' => 'Endpoint tidak ditemukan.'], 404);
                }
            }
        });
    })->create();
