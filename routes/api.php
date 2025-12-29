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
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\LevelController;
use App\Http\Controllers\SpecialtyController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\NotificationController;

// ============================
// PUBLIC ROUTES (No Auth Needed)
// ============================

Route::post('/Login', [LoginController::class, 'login']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
Route::post('/reset-password', [ResetPasswordController::class, 'reset']);

// Optional: Helpful message for wrong method
Route::get('/login', function () {
    return response()->json([
        'message' => 'Use POST /api/Login to authenticate',
        'status' => 'API is working'
    ], 405);
});

// ============================
// PROTECTED ROUTES (Require Auth)
// ============================

Route::middleware('auth:sanctum')->group(function () {

    // Logout - Only one definition needed!
    Route::post('/logout', [LoginController::class, 'logout']);

    // Student & Teacher Exam Access
    Route::get('/student/exams', [StudentExamController::class, 'getMyExams']);
    Route::get('/teacher/exams', [TeacherExamController::class, 'getMyExams']);
    Route::get('/teacher/exams/all', [ExamController::class, 'getTeacherExams']); // if needed

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // User Management (Admin only? Consider adding role middleware later)
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Resources (CRUD)
    Route::apiResource('exams', ExamController::class);
    Route::apiResource('students', StudentController::class);
    Route::apiResource('modules', ModuleController::class);
    Route::apiResource('salles', SalleController::class);
    Route::apiResource('teachers', TeacherController::class);

Route::Resource('academic-years', AcademicYearController::class);
Route::Resource('semesters', SemesterController::class);
Route::Resource('levels', LevelController::class);
Route::Resource('specialties', SpecialtyController::class);
Route::Resource('groups', GroupController::class);
    Route::apiResource('academic-years', AcademicYearController::class);
    Route::apiResource('semesters', SemesterController::class);
    Route::apiResource('levels', LevelController::class);
    Route::apiResource('specialties', SpecialtyController::class);
    Route::apiResource('groups', GroupController::class);

    // Imports
    Route::post('/import/students', [ImportController::class, 'import']); // better naming
    Route::post('/modules/import', [ImportmodulesController::class, 'import']);
    Route::post('/salles/import', [ImportSallesController::class, 'import']);

    // Available rooms
    Route::get('/salles/available', [SalleController::class, 'available']);

    // Claims
    Route::apiResource('claims', ClaimController::class);

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/teacher/{matricule}', [NotificationController::class, 'getTeacherNotifications']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/teacher/{matricule}/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::post('/', [NotificationController::class, 'create']);
        Route::delete('/{id}', [NotificationController::class, 'delete']);
    });
});