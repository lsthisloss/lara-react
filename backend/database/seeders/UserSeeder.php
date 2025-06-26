<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test users only if they don't exist
        if (!User::where('email', 'admin@example.com')->exists()) {
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
            ]);
        }

        if (!User::where('email', 'john@example.com')->exists()) {
            User::create([
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => Hash::make('password'),
            ]);
        }

        if (!User::where('email', 'jane@example.com')->exists()) {
            User::create([
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'password' => Hash::make('password'),
            ]);
        }

        // Create additional users manually (without factory for now)
        $userCount = User::count();
        if ($userCount < 15) {
            for ($i = $userCount; $i < 15; $i++) {
                User::create([
                    'name' => 'User ' . ($i + 1),
                    'email' => 'user' . ($i + 1) . '@example.com',
                    'password' => Hash::make('password'),
                ]);
            }
        }
    }
}
