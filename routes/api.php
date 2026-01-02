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
use App\Http\Controllers\ConvocationController;

// ============================
// PUBLIC ROUTES (No Auth Needed)
// ============================

Route::post('/Login', [LoginController::class, 'login']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
Route::post('/reset-password', [ResetPasswordController::class, 'reset']);

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

    // Logout
    Route::post('/logout', [LoginController::class, 'logout']);

    // Student & Teacher Exam Access
    Route::get('/student/exams', [StudentExamController::class, 'getMyExams']);
    Route::get('/teacher/exams', [TeacherExamController::class, 'getMyExams']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // User Management
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // ========================
    // EXAM MANAGEMENT ROUTES
    // ========================
    Route::prefix('exams')->group(function () {
        // Teacher availability and assignment (specific route before wildcard)
        Route::get('/available-teachers', [ExamController::class, 'getAvailableTeachers']);
        
        // Manual notification to teacher (specific route before wildcard)
        Route::post('/{id}/notify', [ExamController::class, 'notifyTeacher']);
        
        // Bulk operations
        Route::post('/bulk-delete', [ExamController::class, 'bulkDelete']);
        
        // Standard CRUD operations (wildcard routes last)
        Route::get('/', [ExamController::class, 'index']);
        Route::post('/', [ExamController::class, 'store']);
        Route::get('/{id}', [ExamController::class, 'show']);
        Route::put('/{id}', [ExamController::class, 'update']);
        Route::delete('/{id}', [ExamController::class, 'destroy']);
    });

    // Other Resources
    Route::apiResource('students', StudentController::class);
    Route::apiResource('modules', ModuleController::class);
    Route::apiResource('teachers', TeacherController::class);
    Route::apiResource('academic-years', AcademicYearController::class);
    Route::apiResource('semesters', SemesterController::class);
    Route::apiResource('levels', LevelController::class);
    Route::apiResource('specialties', SpecialtyController::class);
    Route::apiResource('groups', GroupController::class);
    Route::apiResource('claims', ClaimController::class);

    // ========================
    // SALLES (ROOMS) ROUTES
    // ========================
    // Available rooms must come BEFORE the resource routes to avoid conflicts
    Route::get('/salles/available', [SalleController::class, 'available']);
    Route::apiResource('salles', SalleController::class);

    // Import Routes
    Route::post('/import/students', [ImportController::class, 'import']);
    Route::post('/import', [ImportController::class, 'store']);
    Route::post('/modules/import', [ImportmodulesController::class, 'import']);
    Route::post('/salles/import', [ImportSallesController::class, 'import']);

    // ========================
    // NOTIFICATIONS ROUTES
    // ========================
    Route::prefix('notifications')->group(function () {
        Route::get('/teacher/{matricule}', [NotificationController::class, 'getTeacherNotifications']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/teacher/{matricule}/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::post('/', [NotificationController::class, 'create']);
        Route::delete('/{id}', [NotificationController::class, 'delete']);
    });

    // ========================
    // CONVOCATIONS ROUTES
    // ========================
    Route::prefix('convocations')->group(function () {
        // Get students list for an exam
        Route::get('/exam/{examId}/students', [ConvocationController::class, 'getStudentsForExam']);
        
        // Generate convocation preview (for PDF generation on frontend)
        Route::get('/exam/{examId}/preview', [ConvocationController::class, 'generateConvocationPreview']);
        
        // Send notification to teacher
        Route::post('/exam/{examId}/notify', [ConvocationController::class, 'sendConvocationNotification']);
        
        // Get convocation history
        Route::get('/exam/{examId}/history', [ConvocationController::class, 'getConvocationHistory']);
    });
});