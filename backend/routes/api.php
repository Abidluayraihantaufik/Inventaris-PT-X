<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StockOpnameController;
use App\Http\Controllers\Api\StockOutController;
use App\Http\Controllers\Api\UserManagementController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — PT Maskitani Inventory System
|--------------------------------------------------------------------------
|
| PRD Section 8: API Specification
|
*/

// ─── Public Routes (tidak perlu login) ───────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/login',           [AuthController::class, 'login']);
    Route::post('/register',        [AuthController::class, 'register']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
});

// ─── Protected Routes (perlu login + status active) ──────────────────────
Route::middleware(['auth:sanctum', 'active.user'])->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
    });

    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('/summary', [DashboardController::class, 'summary']);
        Route::get('/charts',  [DashboardController::class, 'charts']);
        Route::get('/alerts',  [DashboardController::class, 'alerts']);
    });

    // Categories (read: semua | write: admin only)
    Route::get('categories',         [CategoryController::class, 'index']);
    Route::middleware('admin')->group(function () {
        Route::post('categories',         [CategoryController::class, 'store']);
        Route::put('categories/{id}',     [CategoryController::class, 'update']);
        Route::delete('categories/{id}',  [CategoryController::class, 'destroy']);
    });

    // Products (read: semua | write: admin only)
    Route::get('products',        [ProductController::class, 'index']);
    Route::get('products/{id}',   [ProductController::class, 'show']);
    Route::middleware('admin')->group(function () {
        Route::post('products',       [ProductController::class, 'store']);
        Route::put('products/{id}',   [ProductController::class, 'update']);
        Route::delete('products/{id}',[ProductController::class, 'destroy']);
    });

    // Inventory / Batches
    Route::get('inventory',        [InventoryController::class, 'index']);
    Route::get('inventory/{id}',   [InventoryController::class, 'show']);
    Route::middleware('admin')->group(function () {
        Route::post('inventory',       [InventoryController::class, 'store']);
        Route::put('inventory/{id}',   [InventoryController::class, 'update']);
        Route::delete('inventory/{id}',[InventoryController::class, 'destroy']);
    });

    // Stock Out
    Route::prefix('stock-out')->group(function () {
        Route::get('/fefo/{productId}', [StockOutController::class, 'fefoRecommendation']);
        Route::post('/',                [StockOutController::class, 'store']);
        Route::get('/logs',             [StockOutController::class, 'logs']);
        Route::get('/{id}/print',       [StockOutController::class, 'printData']);
    });

    // Stock Opname
    Route::prefix('stock-opname')->group(function () {
        Route::get('/',           [StockOpnameController::class, 'index']);
        Route::post('/',          [StockOpnameController::class, 'store']);
        Route::put('/{id}/verify',[StockOpnameController::class, 'verify'])->middleware('admin');
    });

    // User Management (admin only)
    Route::middleware('admin')->prefix('admin/users')->group(function () {
        Route::get('/',              [UserManagementController::class, 'index']);
        Route::put('/{id}',          [UserManagementController::class, 'update']);
        Route::put('/{id}/status',   [UserManagementController::class, 'updateStatus']);
        Route::delete('/{id}',       [UserManagementController::class, 'destroy']);
    });
});
