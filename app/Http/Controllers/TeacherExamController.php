<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Exam;
use Illuminate\Http\Request;

class TeacherExamController extends Controller
{
    public function getMyExams(Request $request)
    {
        $matricule = $request->query('matricule');

        if (!$matricule) {
            return response()->json([
                'message' => 'Matricule is required'
            ], 400);
        }

        // Find the teacher
        $teacher = User::where('matricule', $matricule)
                       ->where('role', 'teacher')
                       ->first();

        if (!$teacher) {
            return response()->json([
                'message' => 'Teacher not found'
            ], 404);
        }

        // IMPORTANT: Check if your 'teacher' column in exams table contains 
        // the teacher's NAME or MATRICULE and adjust accordingly
        
        // Query exams by teacher - trying both name and matricule for compatibility
        $baseQuery = Exam::where(function($query) use ($teacher) {
                $query->where('teacher', $teacher->name)
                      ->orWhere('teacher', $teacher->matricule);
            })
            ->orderBy('date')
            ->orderBy('start_time');

        // Get exams by type
        $exams = (clone $baseQuery)->where('type', 'examen')->get();
        $cc = (clone $baseQuery)->where('type', 'cc')->get();
        $rattrapage = (clone $baseQuery)->where('type', 'rattrapage')->get();

        return response()->json([
            'teacher' => [
                'name' => $teacher->name,
                'matricule' => $teacher->matricule,
                'email' => $teacher->email,
                'photo' => $teacher->photo ?? null,
                'specialite' => $teacher->specialite ?? null,
                'niveau' => $teacher->niveau ?? null,
                'groupe' => $teacher->groupe ?? null,
            ],
            'exams' => $exams,
            'cc' => $cc,
            'rattrapage' => $rattrapage,
        ]);
    }
}