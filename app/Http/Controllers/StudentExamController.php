<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\User;
use Illuminate\Http\Request;

class StudentExamController extends Controller
{
    public function getMyExams(Request $request)
    {
        $matricule = $request->query('matricule');

        if (!$matricule) {
            return response()->json(['message' => 'Matricule is required'], 400);
        }

        $student = User::where('matricule', $matricule)
            ->where('role', 'student')
            ->first();

        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        $baseQuery = Exam::where('niveau', $student->niveau)
            ->where('group', $student->groupe)
            ->where('specialite', $student->specialite)
            ->orderBy('date')
            ->orderBy('start_time');

        return response()->json([
            'student' => [
                'name' => $student->name,
                'matricule' => $student->matricule,
                'specialite' => $student->specialite,
                'niveau' => $student->niveau,
                'groupe' => $student->groupe,
            ],
            'exams' => (clone $baseQuery)->where('type', 'examen')->get(),
            'cc' => (clone $baseQuery)->where('type', 'cc')->get(),
            'rattrapage' => (clone $baseQuery)->where('type', 'rattrapage')->get(),
        ]);
    }
}
