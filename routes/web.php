<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\loginController;
use App\Http\Controllers\ExamController;

use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\ImportmodulesController;

Route::prefix('admin')->name('admin.')->group(function () {

    Route::resource('teachers', TeacherController::class);
    Route::resource('students', StudentController::class);
    Route::resource('salle', SalleController::class);

    // 🚀 ROUTES POUR IMPORT DES MODULES (AVANT resource)
    Route::get('/modules/import', [ImportmodulesController::class, 'showForm'])
        ->name('modules.import');

    Route::post('/modules/import', [ImportmodulesController::class, 'import'])
        ->name('modules.import.submit');

    // Resource modules (APRÈS les routes spécifiques)
    Route::resource('modules', ModuleController::class);
});
// Forgot Password Routes

Route::get('/logout', [LoginController::class, 'logout']);

Route::middleware('auth')->get('/homeuser', [ExamController::class, 'dashboard'])->name('dashboard');


Route::get('/import', [ImportController::class, 'showForm'])->name('import.form');
Route::post('/import', [ImportController::class, 'import']);

Route::get('/admin/exams', [ExamController::class, 'index'])->name('exams.index');
Route::get('/admin/exams/create', [ExamController::class, 'create'])->name('exams.create');
Route::post('/admin/exams', [ExamController::class, 'store'])->name('exams.store');

Route::resource('exams', ExamController::class);


// Route to display all users
Route::get('/users-list', function () {
    $users = \App\Models\User::orderBy('created_at', 'desc')->get();
    
    $successMessage = session('success');
    
    $html = '<!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Liste des utilisateurs</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            .container {
                max-width: 1400px;
                margin: 0 auto;
                background: white;
                border-radius: 15px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                padding: 40px;
            }
            h1 {
                color: #333;
                margin-bottom: 30px;
                text-align: center;
            }
            .success {
                background: #d4edda;
                color: #155724;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                border-left: 4px solid #28a745;
                animation: slideIn 0.5s;
            }
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .buttons {
                margin-bottom: 20px;
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                text-decoration: none;
                display: inline-block;
                transition: transform 0.2s;
            }
            .btn:hover { transform: translateY(-2px); }
            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .btn-danger {
                background: #dc3545;
                color: white;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th {
                background: #667eea;
                color: white;
                padding: 15px;
                text-align: left;
                font-weight: 600;
                position: sticky;
                top: 0;
            }
            td {
                padding: 12px 15px;
                border-bottom: 1px solid #ddd;
            }
            tr:hover {
                background: #f5f5f5;
            }
            .badge {
                padding: 5px 12px;
                border-radius: 15px;
                font-size: 12px;
                font-weight: 600;
                display: inline-block;
            }
            .badge-student {
                background: #d1ecf1;
                color: #0c5460;
            }
            .badge-teacher {
                background: #fff3cd;
                color: #856404;
            }
            .badge-admin {
                background: #f8d7da;
                color: #721c24;
            }
            .empty {
                text-align: center;
                padding: 60px 20px;
                color: #999;
                font-size: 18px;
            }
            .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .stat-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
            }
            .stat-card h3 {
                font-size: 32px;
                margin-bottom: 5px;
            }
            .stat-card p {
                opacity: 0.9;
            }
        </style>
    </head>
    <body>
        <div class="container">';
    
    if ($successMessage) {
        $html .= '<div class="success">✅ ' . $successMessage . '</div>';
    }
    
    $html .= '<h1>📋 Gestion des Utilisateurs</h1>';
    
    // Statistics
    $totalUsers = $users->count();
    $students = $users->where('role', 'student')->count();
    $teachers = $users->where('role', 'teacher')->count();
    $admins = $users->where('role', 'admin')->count();
    
    $html .= '<div class="stats">
                <div class="stat-card">
                    <h3>' . $totalUsers . '</h3>
                    <p>Total Utilisateurs</p>
                </div>
                <div class="stat-card">
                    <h3>' . $students . '</h3>
                    <p>Étudiants</p>
                </div>
                <div class="stat-card">
                    <h3>' . $teachers . '</h3>
                    <p>Enseignants</p>
                </div>
                <div class="stat-card">
                    <h3>' . $admins . '</h3>
                    <p>Administrateurs</p>
                </div>
              </div>';
    
    $html .= '<div class="buttons">
                <a href="/import" class="btn btn-primary">⬆️ Importer plus d\'utilisateurs</a>
                <a href="/delete-all-users" class="btn btn-danger" onclick="return confirm(\'⚠️ Êtes-vous sûr de vouloir supprimer TOUS les utilisateurs ?\')">🗑️ Tout supprimer</a>
              </div>';
    
    if ($users->isEmpty()) {
        $html .= '<div class="empty">
                    <p>❌ Aucun utilisateur trouvé</p>
                    <p style="margin-top: 10px;">Cliquez sur "Importer plus d\'utilisateurs" pour commencer</p>
                  </div>';
    } else {
        $html .= '<div style="overflow-x: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Matricule</th>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Rôle</th>
                                <th>Mot de passe</th>
                                <th>Date création</th>
                            </tr>
                        </thead>
                        <tbody>';
        
        foreach ($users as $user) {
            $roleBadge = 'badge-student';
            if ($user->role == 'teacher') $roleBadge = 'badge-teacher';
            if ($user->role == 'admin') $roleBadge = 'badge-admin';
            
            $html .= '<tr>';
            $html .= '<td><strong>#' . $user->id . '</strong></td>';
            $html .= '<td><strong>' . $user->matricule . '</strong></td>';
            $html .= '<td>' . $user->name . '</td>';
            $html .= '<td>' . $user->email . '</td>';
            $html .= '<td><span class="badge ' . $roleBadge . '">' . strtoupper($user->role) . '</span></td>';
            $html .= '<td><code>123456</code></td>';
            $html .= '<td>' . $user->created_at->format('d/m/Y H:i') . '</td>';
            $html .= '</tr>';
        }
        
        $html .= '</tbody></table></div>';
    }
    
    $html .= '</div></body></html>';
    
    return $html;
});

// Route to delete all users
Route::get('/delete-all-users', function () {
    \App\Models\User::truncate();
    return redirect('/users-list')->with('success', 'Tous les utilisateurs ont été supprimés !');
});
