<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Laravel\Sanctum\PersonalAccessToken;
use App\Models\User;
use App\Models\Post;

class DebugTokens extends Command
{
    protected $signature = 'debug:tokens {token?}';
    protected $description = 'Debug Sanctum tokens and user-post relationships';

    public function handle()
    {
        $this->info('Debug tokens and posts');
        
        // Get 5 most recent tokens
        $tokens = PersonalAccessToken::orderBy('created_at', 'desc')->limit(5)->get();

        $this->info("\n5 most recent tokens:");
        foreach ($tokens as $token) {
            $this->line("Token ID: {$token->id}, User ID: {$token->tokenable_id}, Created: {$token->created_at}");
        }

        // Check user-post relationships
        $recentPosts = Post::with('user')->orderBy('created_at', 'desc')->limit(5)->get();

        $this->info("\n5 most recent posts:");
        foreach ($recentPosts as $post) {
            $userName = $post->user ? $post->user->name : 'Unknown';
            $userEmail = $post->user ? $post->user->email : 'Unknown';
            $this->line("Post ID: {$post->id}, Title: {$post->title}, User ID: {$post->user_id}, User: {$userName} ({$userEmail})");
        }

        // If we have a token as argument, validate it
        $tokenStr = $this->argument('token');
        if ($tokenStr) {
            $this->info("\nValidating provided token: " . substr($tokenStr, 0, 10) . "...");
            $accessToken = PersonalAccessToken::findToken($tokenStr);
            
            if (!$accessToken) {
                $this->error("Invalid token");
                return;
            }
            
            $user = $accessToken->tokenable;
            
            if (!$user) {
                $this->error("Token exists but user not found");
                return;
            }
            
            $this->info("Valid token for user ID: {$user->id}, Email: {$user->email}");
        }
    }
}
