<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/*
Контроллер для панели управления администратора.
Содержит методы для получения статистики, списка пользователей и управления правами администратора.
*/
class DashboardController extends Controller
{
    /**
     * Получить статистику и последние действия на панели управления
     */
    public function index(): JsonResponse
    {
        $totalUsers = User::count();
        $totalPosts = Post::count();
        $totalAdmins = User::where('is_admin', true)->count();
        
        $recentUsers = User::latest()
            ->take(5)
            ->select('id', 'name', 'email', 'created_at', 'is_admin')
            ->get();
            
        $recentPosts = Post::with('user:id,name')
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'total_posts' => $totalPosts,
                'total_admins' => $totalAdmins,
            ],
            'recent_users' => $recentUsers,
            'recent_posts' => $recentPosts,
        ]);
    }

    /**
     * Получить список всех пользователей с их постами и статусом администратора
     */
    public function users(): JsonResponse
    {
        $users = User::select('id', 'name', 'email', 'created_at', 'is_admin')
            ->withCount('posts')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    /**
     * Тогглить статус администратора пользователя
     */
    public function toggleAdmin(User $user): JsonResponse
    {
        $user->update([
            'is_admin' => !$user->is_admin
        ]);

        return response()->json([
            'message' => 'User admin status updated successfully',
            'user' => $user->only(['id', 'name', 'email', 'is_admin'])
        ]);
    }
}
