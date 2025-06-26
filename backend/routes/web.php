<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// CSRF token route for SPA
Route::get('/sanctum/csrf-cookie', function () {
    return response('', 204);
})->middleware('web');
