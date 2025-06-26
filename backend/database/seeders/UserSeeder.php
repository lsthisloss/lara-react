<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        if (!User::where('email', 'admin@dev.pro')->exists()) {
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@dev.pro',
                'password' => Hash::make('password'),
                'is_admin' => true,
            ]);
        }
        
        $userCount = User::count();
        if ($userCount < 15) {
            $usersToCreate = 15 - $userCount;
            
            // Создаем пользователей с реалистичными данными через Factory
            User::factory($usersToCreate)->create();
        }
    }
}
