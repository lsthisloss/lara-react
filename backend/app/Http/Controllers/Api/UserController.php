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
        $token = $request->bearerToken();
        $tokenPrefix = $token ? substr($token, 0, 20) . '...' : 'no token';
        $user = null;
        
        // Получаем пользователя из токена напрямую (более надежно)
        if ($token) {
            $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if ($accessToken) {
                $user = User::find($accessToken->tokenable_id);
                error_log("UserController getCurrentUser - Token: $tokenPrefix, Token owner ID: {$accessToken->tokenable_id}");
            } else {
                error_log("UserController getCurrentUser - Token not found in database");
            }
        }
        
        // Если не удалось получить из токена, пробуем стандартный способ
        if (!$user) {
            $user = $request->user();
            error_log("UserController getCurrentUser - Token: $tokenPrefix, Request user ID: " . ($user ? $user->id : 'null'));
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
