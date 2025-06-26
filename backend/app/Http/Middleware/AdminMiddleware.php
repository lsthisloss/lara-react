<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /*
    Хендлер для проверки прав администратора.
    Проверяет, является ли пользователь администратором.
    Если нет, возвращает ответ с ошибкой 403.
    */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check() || !auth()->user()->isAdmin()) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Admin access required'
            ], 403);
        }

        return $next($request);
    }
}
