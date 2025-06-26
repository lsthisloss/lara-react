<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/*
    * PostFactory - Фабрика для создания постов
    * Используется для генерации тестовых данных в базе данных
    * Позволяет создавать посты с реалистичными данными
    */
class PostFactory extends Factory
{
    /*Дефолтная модель, к которой относится фабрика*/
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(rand(3, 8)), // Заголовок из 3-8 слов
            'content' => fake()->paragraphs(rand(2, 5), true), // 2-5 параграфов
            'user_id' => \App\Models\User::factory(), // Создает связанного пользователя
        ];
    }
}
