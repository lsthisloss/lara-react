<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
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

        $post = Post::create([
            'title' => $request->title,
            'content' => $request->content,
            'user_id' => Auth::id(),
        ]);

        return new PostResource($post->load('user'));
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
        // Check if the user can edit this post (author or admin)
        if ($post->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
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
        // Проверяем, что пользователь может удалить этот пост (автор или админ)
        if ($post->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }
}
