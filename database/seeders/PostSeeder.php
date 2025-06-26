<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        $posts = [
            [
                'title' => 'Welcome to Our Blog',
                'content' => 'This is our first blog post. We are excited to share our thoughts and ideas with you.',
            ],
            [
                'title' => 'Laravel Tips and Tricks',
                'content' => 'Here are some useful Laravel tips that can help you in your development journey.',
            ],
            [
                'title' => 'React Best Practices',
                'content' => 'Learn about React best practices to write clean and maintainable code.',
            ],
            [
                'title' => 'Full-Stack Development Guide',
                'content' => 'A comprehensive guide to becoming a full-stack developer in 2025.',
            ],
            [
                'title' => 'Database Design Principles',
                'content' => 'Understanding the fundamental principles of good database design.',
            ],
        ];

        foreach ($posts as $postData) {
            Post::create([
                'title' => $postData['title'],
                'content' => $postData['content'],
                'user_id' => $users->random()->id,
            ]);
        }

        // Create additional random posts
        for ($i = 0; $i < 20; $i++) {
            Post::create([
                'title' => 'Sample Post ' . ($i + 1),
                'content' => 'This is sample content for post ' . ($i + 1) . '. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                'user_id' => $users->random()->id,
            ]);
        }
    }
}
