<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\ExamController;

Route::post('/login', [LoginController::class, 'login']);

// GET route just to test if API is working
Route::get('/login', function() {
    return response()->json([
        'message' => 'Please use POST method to login',
        'status' => 'API is working'
    ]);
});

Route::resource('exams', ExamController::class);