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
        if (!User::where('email', 'admin@dev.pro')->exists()) {
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@dev.pro',
                'password' => Hash::make('password'),
                'is_admin' => true,
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

        // Create additional users using factory only if we have less than 15 users
        $currentUserCount = User::count();
        if ($currentUserCount < 15) {
            $usersToCreate = 15 - $currentUserCount;
            User::factory($usersToCreate)->create();
        }
    }
}
