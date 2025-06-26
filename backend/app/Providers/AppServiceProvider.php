<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Дополнительное логирование при резолвинге пользователей из Auth фасада
        Auth::viaRequest('custom', function ($request) {
            $token = $request->bearerToken();
            
            if (!$token) {
                error_log("AppServiceProvider: No bearer token in request");
                return null;
            }
            
            $accessToken = PersonalAccessToken::findToken($token);
            
            if (!$accessToken) {
                error_log("AppServiceProvider: Invalid token: " . substr($token, 0, 10) . "...");
                return null;
            }
            
            $user = $accessToken->tokenable;
            
            error_log("AppServiceProvider: Resolved user from token: ID={$user->id}, Email={$user->email}");
            
            return $user;
        });
    }
}
