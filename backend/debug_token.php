<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\DB;

// Simple token validator
function validateToken($token) {
    $accessToken = PersonalAccessToken::findToken($token);
    
    if (!$accessToken) {
        echo "Invalid token: " . substr($token, 0, 20) . "...\n";
        return null;
    }
    
    $user = $accessToken->tokenable;
    
    if (!$user) {
        echo "Token exists but user not found\n";
        return null;
    }
    
    echo "Valid token for user ID: {$user->id}, Email: {$user->email}\n";
    return $user;
}

// Get 5 most recent tokens
$tokens = DB::table('personal_access_tokens')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get();

echo "5 most recent tokens:\n";
foreach ($tokens as $token) {
    echo "Token ID: {$token->id}, User ID: {$token->tokenable_id}, Created: {$token->created_at}\n";
}

// Check user-post relationships
$recentPosts = DB::table('posts')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get();

echo "\n5 most recent posts:\n";
foreach ($recentPosts as $post) {
    $user = DB::table('users')->where('id', $post->user_id)->first();
    $userName = $user ? $user->name : 'Unknown';
    $userEmail = $user ? $user->email : 'Unknown';
    
    echo "Post ID: {$post->id}, Title: {$post->title}, User ID: {$post->user_id}, User: {$userName} ({$userEmail})\n";
}

// If we have a token as argument, validate it
if ($argc > 1) {
    $token = $argv[1];
    echo "\nValidating provided token: " . substr($token, 0, 10) . "...\n";
    $user = validateToken($token);
}
