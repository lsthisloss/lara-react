<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/*
    * UserFactory - Фабрика для создания пользователей
    * Используется для генерации тестовых данных в базе данных
    * Позволяет создавать пользователей с реалистичными данными
*/
class UserFactory extends Factory
{

    protected static ?string $password;

    /*
    Дефолтная модель, к которой относится фабрика
    */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'is_admin' => false, // По умолчанию не админ
        ];
    }

    /*
    Имейл адрес должен быть не подтвержден.
    */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
    
    /*
    Создает администратора.
    */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_admin' => true,
        ]);
    }
}
