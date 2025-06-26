<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // User profile routes
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'changePassword']);
    Route::get('/users/{id}/profile', [AuthController::class, 'getUserProfile']);
    Route::get('/users', [AuthController::class, 'getAllUsers']);
    
    // CRUD operations for posts
    Route::apiResource('posts', PostController::class);
    
    // Admin only routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/dashboard', [App\Http\Controllers\Api\DashboardController::class, 'index']);
        Route::get('/admin/users', [App\Http\Controllers\Api\DashboardController::class, 'users']);
        Route::patch('/admin/users/{user}/toggle-admin', [App\Http\Controllers\Api\DashboardController::class, 'toggleAdmin']);
    });
});
