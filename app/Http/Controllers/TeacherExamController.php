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

        // Query exams taught by this teacher (by name) and also include exams
        // that match the teacher's niveau/group/specialite as a fallback.
        // We merge and deduplicate so the teacher sees exams the same way a student does.
        $baseQueryByTeacher = Exam::where('teacher', $teacher->name)
            ->orderBy('date')
            ->orderBy('start_time');

        $baseQueryByGroup = Exam::where('niveau', $teacher->niveau)
            ->where('group', $teacher->groupe)
            ->where('specialite', $teacher->specialite)
            ->orderBy('date')
            ->orderBy('start_time');

        // Helper to merge two query results and remove duplicates by id
        $mergeResults = function($q1, $q2, $type) {
            $col1 = (clone $q1)->where('type', $type)->get();
            $col2 = (clone $q2)->where('type', $type)->get();
            return $col1->merge($col2)->unique('id')->values();
        };

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
}