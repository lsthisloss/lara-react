<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/*
    * AuthController - Контроллер для управления аутентификацией пользователей.
    * Содержит методы для регистрации, входа, выхода, получения информации о пользователе и обновления профиля.
    */
class AuthController extends Controller
{
    /**
     * Регистрация нового пользователя
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Детальное логирование
        error_log("AuthController register - Created user ID: {$user->id}, Email: {$user->email}");

        $token = $user->createToken('auth_token')->plainTextToken;
        
        // Проверяем что токен привязан к правильному пользователю
        $tokenRecord = $user->tokens()->latest()->first();
        error_log("AuthController register - Token created: tokenable_id={$tokenRecord->tokenable_id}, user_id={$user->id}");

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Вход пользователя в систему
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();
        
        // Детальное логирование
        error_log("AuthController login - Authenticated user ID: {$user->id}, Email: {$user->email}");
        
        $token = $user->createToken('auth_token')->plainTextToken;
        
        // Проверяем что токен привязан к правильному пользователю
        $tokenRecord = $user->tokens()->latest()->first();
        error_log("AuthController login - Token created: tokenable_id={$tokenRecord->tokenable_id}, user_id={$user->id}");

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }
    /**
     * Выход пользователя из системы
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        
        if ($user) {
            // Удаляем все токены пользователя (более безопасный подход)
            $user->tokens()->delete();
        }

        return response()->json(['message' => 'Logged out successfully']);
    }
}
