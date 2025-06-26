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
        // Переопределение способа получения пользователя через request
        $this->app->rebinding('request', function ($app, $request) {
            if ($request->bearerToken()) {
                $request->setUserResolver(function () use ($request) {
                    $token = $request->bearerToken();
                    $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                    
                    if ($accessToken) {
                        return $accessToken->tokenable;
                    }
                    
                    return \Illuminate\Support\Facades\Auth::user();
                });
            }
        });
    }
}
