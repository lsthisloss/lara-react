<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

        // Получаем пользователя напрямую из токена
        $token = $request->bearerToken();
        $userId = null;
        $userEmail = null;
        
        if ($token) {
            $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if ($accessToken) {
                $tokenUser = $accessToken->tokenable;
                $userId = $tokenUser->id;
                $userEmail = $tokenUser->email;
                
                error_log("PostController store - Token: " . substr($token, 0, 20) . "...");
                error_log("PostController store - Token owner: ID={$userId}, Email={$userEmail}");
            }
        }
        
        // Если не смогли получить пользователя из токена, используем обычный способ
        if (!$userId) {
            $currentUser = $request->user();
            if (!$currentUser) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }
            $userId = $currentUser->id;
            $userEmail = $currentUser->email;
            
            error_log("PostController store - Request user: ID={$userId}, Email={$userEmail}");
        }

        $post = Post::create([
            'title' => $request->title,
            'content' => $request->content,
            'user_id' => $userId,
        ]);

        error_log("PostController post created - Post ID: {$post->id}, Post user_id: {$post->user_id}");

        // Принудительно перезагружаем пост из БД с отношением
        $post = Post::with('user')->find($post->id);

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
        // Получаем пользователя и его ID из токена (если возможно)
        $token = $request->bearerToken();
        $userId = null;
        
        if ($token) {
            $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if ($accessToken) {
                $userId = $accessToken->tokenable_id;
                $user = User::find($userId);
            }
        }
        
        // Если не нашли через токен, используем обычную аутентификацию
        if (!$userId) {
            $user = Auth::user();
            $userId = Auth::id();
        }
        
        // Проверяем права доступа
        $isAuthor = $post->user_id === $userId;
        $isAdmin = $user && $user->isAdmin();
        
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
    public function destroy(Post $post)
    {
        // Получаем пользователя и его ID из токена (если возможно)
        $token = request()->bearerToken();
        $userId = null;
        
        if ($token) {
            $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if ($accessToken) {
                $userId = $accessToken->tokenable_id;
                $user = User::find($userId);
            }
        }
        
        // Если не нашли через токен, используем обычную аутентификацию
        if (!$userId) {
            $user = Auth::user();
            $userId = Auth::id();
        }
        
        // Проверяем права доступа
        $isAuthor = $post->user_id === $userId;
        $isAdmin = $user && $user->isAdmin();
        
        if (!$isAuthor && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }
}
