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
            'teacher' => [
                'name' => $teacher->name,
                'email' => $teacher->email,
                'matricule' => $teacher->matricule,
                'email' => $teacher->email,
            ],
            'exams' => $mergeResults($baseQueryByTeacher, $baseQueryByGroup, 'examen'),
            'cc' => $mergeResults($baseQueryByTeacher, $baseQueryByGroup, 'cc'),
            'rattrapage' => $mergeResults($baseQueryByTeacher, $baseQueryByGroup, 'rattrapage'),
        ]);
    }

    // ✅ FIXED: Query by matricule instead of name
    $baseQueryByTeacher = Exam::where('teacher', $teacher->matricule)
        ->orderBy('date')
        ->orderBy('start_time');

    // ✅ OPTIONAL: Remove group query if teachers don't have niveau/group/specialite
    // Or keep if needed, but ensure fields exist on teacher User

    // Helper to get by type (only use teacher query if group is irrelevant)
    $getByType = function($type) use ($baseQueryByTeacher) {
        return (clone $baseQueryByTeacher)->where('type', $type)->get();
    };

    return response()->json([
        'teacher' => [
            'name' => $teacher->name,
            'matricule' => $teacher->matricule,
            'email' => $teacher->email,
        ],
        'exams' => $getByType('examen'),
        'cc' => $getByType('cc'),
        'rattrapage' => $getByType('rattrapage'),
    ]);
}
}