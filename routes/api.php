<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\ImportmodulesController;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\ImportSallesController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\StudentExamController;
use App\Http\Controllers\TeacherExamController;
use App\Http\Controllers\ClaimController;

Route::post('/Login', [LoginController::class, 'login']);

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


Route::resource('modules', ModuleController::class);
Route::post('/modules/import', [ImportmodulesController::class, 'import']);


Route::resource('salles', SalleController::class);

// Return available rooms for a given date/time (optional: exclude_exam_id)
Route::get('/salles/available', [SalleController::class, 'available']);

Route::post('/salles/import', [ImportSallesController::class, 'import']);
Route::resource('teachers', TeacherController::class);


Route::get('/student/exams', [StudentExamController::class, 'getMyExams']);
Route::get('/teacher/exams', [TeacherExamController::class, 'getMyExams']);


// routes/api.php
Route::apiResource('claims', ClaimController::class);