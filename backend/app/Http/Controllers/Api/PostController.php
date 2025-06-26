<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

/*
Контроллер для управления постами.
Содержит методы для получения списка постов, создания, обновления и удаления постов.
Использует ресурс PostResource для форматирования ответов API.
*/
class PostController extends Controller
{
    /**
     * Показать список ресурсов.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $posts = Post::with('user')->latest()->paginate($perPage);
        return PostResource::collection($posts);
    }

    /**
     * Хранить новый ресурс.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        // Получаем Bearer токен из запроса напрямую
        $bearerToken = $request->bearerToken();
        
        if (!$bearerToken) {
            return response()->json(['error' => 'Unauthenticated - No token provided'], 401);
        }
        
        // Находим токен в базе данных напрямую через Sanctum
        $token = PersonalAccessToken::findToken($bearerToken);
        
        if (!$token) {
            return response()->json(['error' => 'Unauthenticated - Invalid token'], 401);
        }
        
        // Получаем пользователя напрямую из токена
        $user = $token->tokenable;
        
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated - User not found'], 401);
        }
        
        error_log("PostController store - Token: " . substr($bearerToken, 0, 20) . "...");
        error_log("PostController store - User from token: ID={$user->id}, Email={$user->email}");

        // Прямая вставка в БД для обхода любых возможных модификаций
        $userId = $user->id;
        $postData = [
            'title' => $request->title,
            'content' => $request->content,
            'user_id' => $userId,
            'created_at' => now(),
            'updated_at' => now(),
        ];
        
        // Создаем пост напрямую
        $post = new Post();
        $post->forceFill($postData);
        $post->saveQuietly();
        
        error_log("PostController post created - Post ID: {$post->id}, User ID: {$userId}");
        
        // Перезагружаем пост с отношениями для ответа
        $post = Post::with('user')->findOrFail($post->id);
        
        error_log("PostController post loaded - Post ID: {$post->id}, User ID: {$post->user_id}, User: {$post->user->name}");
        
        return new PostResource($post);
    }

    /**
     * Показать указанный ресурс.
     */
    public function show(Post $post)
    {
        return new PostResource($post->load('user'));
    }

    /**
     * Обновить указанный ресурс в хранилище.
     */
    public function update(Request $request, Post $post)
    {
        // Получаем пользователя и его ID из токена
        $bearerToken = $request->bearerToken();
        
        if (!$bearerToken) {
            return response()->json(['error' => 'Unauthenticated - No token provided'], 401);
        }
        
        $token = PersonalAccessToken::findToken($bearerToken);
        
        if (!$token) {
            return response()->json(['error' => 'Unauthenticated - Invalid token'], 401);
        }
        
        $user = $token->tokenable;
        
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated - User not found'], 401);
        }
        
        // Проверяем права доступа
        $isAuthor = $post->user_id === $user->id;
        $isAdmin = $user->isAdmin();
        
        if (!$isAuthor && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $post->update([
            'title' => $request->title,
            'content' => $request->content,
        ]);

        return new PostResource($post->load('user'));
    }

    /**
     * Удалить указанный ресурс из хранилища.
     */
    public function destroy(Request $request, Post $post)
    {
        // Получаем пользователя и его ID из токена
        $bearerToken = $request->bearerToken();
        
        if (!$bearerToken) {
            return response()->json(['error' => 'Unauthenticated - No token provided'], 401);
        }
        
        $token = PersonalAccessToken::findToken($bearerToken);
        
        if (!$token) {
            return response()->json(['error' => 'Unauthenticated - Invalid token'], 401);
        }
        
        $user = $token->tokenable;
        
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated - User not found'], 401);
        }
        
        // Проверяем права доступа
        $isAuthor = $post->user_id === $user->id;
        $isAdmin = $user->isAdmin();
        
        if (!$isAuthor && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }
}
