<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

/*
    * User - Модель пользователя
    * Используется для аутентификации и авторизации
    * Связана с моделью Post через отношение "имеет много"
    */
class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /*
    Атрибуты, которые могут быть массово присвоены.
    */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin',
    ];

    /*
    Атрибуты, которые должны быть скрыты при сериализации.
    */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /*
    Получает атрибуты, которые должны быть приведены к типу.
    */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
        ];
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Проверяет, является ли пользователь администратором.
     */
    public function isAdmin(): bool
    {
        return (bool)$this->is_admin;
    }
}
