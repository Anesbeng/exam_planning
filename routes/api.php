<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;

Route::post('/login', [LoginController::class, 'login']);

// GET route just to test if API is working
Route::get('/login', function() {
    return response()->json([
        'message' => 'Please use POST method to login',
        'status' => 'API is working'
    ]);
});

Route::resource('exams', ExamController::class);


Route::resource('students', StudentController::class);
Route::resource('import', ImportController ::class);
Route::get('/dashboard', [DashboardController::class, 'index']);
Route::get('/users', [UserController::class, 'index']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

