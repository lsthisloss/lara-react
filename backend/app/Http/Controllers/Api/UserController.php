<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * UserController - Контроллер для управления пользователями
 * Содержит методы для работы с профилями пользователей
 */
class UserController extends Controller
{
    /**
     * Получить информацию о текущем пользователе
     */
    public function getCurrentUser(Request $request)
    {
        // Проверка нескольких способов получения пользователя для отладки
        $userFromRequest = $request->user();
        $userFromAuth = \Illuminate\Support\Facades\Auth::user();
        
        // Токен напрямую
        $bearerToken = $request->bearerToken();
        $userFromToken = null;
        
        if ($bearerToken) {
            $token = \Laravel\Sanctum\PersonalAccessToken::findToken($bearerToken);
            if ($token) {
                $userFromToken = $token->tokenable;
            }
        }
        
        // Логирование результатов для отладки
        error_log("UserController getCurrentUser - Request path: " . $request->path());
        error_log("UserController getCurrentUser - Token: " . ($bearerToken ? substr($bearerToken, 0, 20) . '...' : 'no token'));
        error_log("UserController getCurrentUser - User from request: " . ($userFromRequest ? "ID={$userFromRequest->id}" : 'null'));
        error_log("UserController getCurrentUser - User from Auth: " . ($userFromAuth ? "ID={$userFromAuth->id}" : 'null'));
        error_log("UserController getCurrentUser - User from token: " . ($userFromToken ? "ID={$userFromToken->id}" : 'null'));
        
        // Используем пользователя из токена, если доступен, иначе из запроса
        $user = $userFromToken ?? $userFromRequest;
        
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }
        
        return response()->json($user);
    }

    /**
     * Обновить профиль пользователя
     */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $request->user()->id,
        ]);

        $user = $request->user();
        $user->name = $request->name;
        $user->email = $request->email;
        $user->save();

        return response()->json($user);
    }

    /**
     * Изменить пароль пользователя
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        // Check if current password matches
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Password changed successfully']);
    }

    /**
     * Получить профиль пользователя по ID
     */
    public function getUserProfile(Request $request, $id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    /**
     * Получить список всех пользователей
     */
    public function getAllUsers(Request $request)
    {
        // You might want to add pagination here for larger datasets
        $users = User::all();
        return response()->json(['data' => $users]);
    }
}
