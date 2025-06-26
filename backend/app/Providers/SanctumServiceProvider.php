<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class SanctumServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Устанавливаем собственный обработчик для извлечения пользователя из токена
        Sanctum::authenticateAccessTokensUsing(function (
            PersonalAccessToken $accessToken,
            bool $is_valid_for_abilities
        ) {
            // Всегда используем пользователя из токена, а не из сессии
            if ($is_valid_for_abilities) {
                // Логируем для отладки
                \Illuminate\Support\Facades\Log::debug("SanctumServiceProvider: Using token owner ID: {$accessToken->tokenable_id}");
                return true;
            }
            
            return false;
        });

        // Переопределяем метод, который определяет пользователя из запроса
        $this->app->rebinding('request', function ($app, $request) {
            $request->setUserResolver(function () use ($request) {
                // Сначала пытаемся получить пользователя из токена
                $token = $request->bearerToken();
                if ($token) {
                    $accessToken = PersonalAccessToken::findToken($token);
                    if ($accessToken) {
                        $user = $accessToken->tokenable;
                        \Illuminate\Support\Facades\Log::debug("Request user resolver: Using token owner ID: {$user->id}");
                        return $user;
                    }
                }
                
                // Если не получилось, используем стандартное разрешение пользователя
                return Auth::user();
            });
        });
    }
}
