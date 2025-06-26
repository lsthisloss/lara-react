<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // User profile routes
    Route::get('/user', [UserController::class, 'getCurrentUser']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::put('/user/password', [UserController::class, 'changePassword']);
    Route::get('/users/{id}/profile', [UserController::class, 'getUserProfile']);
    Route::get('/users', [UserController::class, 'getAllUsers']);
    
    // CRUD operations for posts
    Route::apiResource('posts', PostController::class);
    
    // Admin only routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/dashboard', [App\Http\Controllers\Api\DashboardController::class, 'index']);
        Route::get('/admin/users', [App\Http\Controllers\Api\DashboardController::class, 'users']);
        Route::patch('/admin/users/{user}/toggle-admin', [App\Http\Controllers\Api\DashboardController::class, 'toggleAdmin']);
    });
});
