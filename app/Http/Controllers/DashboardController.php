<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Exam;
use App\Models\Module;
use App\Models\Salle;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'users'     => User::count(),
            'teachers'  => User::where('role', 'teacher')->count(),
            'students'  => User::where('role', 'student')->count(),
            'modules'   => Module::count(),
            'rooms'     => Salle::count(),
            'exams'     => Exam::count(),
        ]);
    }
}
