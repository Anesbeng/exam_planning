<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ConvocationController extends Controller
{
    /**
     * Get list of students for a specific exam (convocation)
     */
    public function getStudentsForExam($examId)
    {
        try {
            $exam = Exam::findOrFail($examId);

            // Find all students matching this exam's criteria
            $students = User::where('role', 'student')
                ->where('niveau', $exam->niveau)
                ->where('groupe', $exam->group)
                ->where('specialite', $exam->specialite)
                ->orderBy('name')
                ->get(['id', 'name', 'matricule', 'email', 'niveau', 'groupe', 'specialite']);

            return response()->json([
                'exam' => [
                    'id' => $exam->id,
                    'type' => $exam->type,
                    'module' => $exam->module,
                    'teacher' => $exam->teacher,
                    'room' => $exam->room,
                    'date' => $exam->date,
                    'start_time' => $exam->start_time,
                    'end_time' => $exam->end_time,
                    'niveau' => $exam->niveau,
                    'group' => $exam->group,
                    'specialite' => $exam->specialite,
                    'semester' => $exam->semester,
                ],
                'students' => $students,
                'total_students' => $students->count()
            ]);
        } catch (\Exception $e) {
            Log::error("Error fetching students for exam: " . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching students',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate convocation preview - returns data for PDF generation
     */
    public function generateConvocationPreview($examId)
    {
        try {
            $exam = Exam::findOrFail($examId);

            $students = User::where('role', 'student')
                ->where('niveau', $exam->niveau)
                ->where('groupe', $exam->group)
                ->where('specialite', $exam->specialite)
                ->orderBy('name')
                ->get(['name', 'matricule', 'email']);

            // Get teacher details
            $teacher = User::where('name', $exam->teacher)
                ->where('role', 'teacher')
                ->first();

            $convocationData = [
                'exam_info' => [
                    'type' => $exam->type,
                    'module' => $exam->module,
                    'date' => $exam->date,
                    'start_time' => $exam->start_time,
                    'end_time' => $exam->end_time,
                    'room' => $exam->room,
                    'niveau' => $exam->niveau,
                    'group' => $exam->group,
                    'specialite' => $exam->specialite,
                    'semester' => $exam->semester,
                ],
                'teacher_info' => [
                    'name' => $exam->teacher,
                    'email' => $teacher->email ?? null,
                    'matricule' => $teacher->matricule ?? null,
                ],
                'students' => $students->map(function($student, $index) {
                    return [
                        'numero' => $index + 1,
                        'name' => $student->name,
                        'matricule' => $student->matricule,
                        'email' => $student->email,
                    ];
                }),
                'total_students' => $students->count(),
                'generated_at' => now()->format('Y-m-d H:i:s'),
                'university' => 'Université Abou Bekr Belkaïd - Tlemcen',
                'department' => 'Département Informatique',
            ];

            return response()->json($convocationData);
        } catch (\Exception $e) {
            Log::error("Error generating convocation preview: " . $e->getMessage());
            return response()->json([
                'message' => 'Error generating convocation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send convocation notification to teacher
     */
    public function sendConvocationNotification($examId)
{
    try {
        $exam = Exam::findOrFail($examId);

        $teacherName = trim($exam->teacher);

        $teacher = User::whereRaw(
            'LOWER(name) = ?',
            [strtolower($teacherName)]
        )->where('role', 'teacher')->first();

        if (!$teacher) {
            return response()->json([
                'message' => "Teacher not found with name: $teacherName"
            ], 404);
        }

        // ✅ FIX ENUM PROBLEM
        $examType = strtolower($exam->type);
        if (!in_array($examType, ['exam', 'cc', 'rattrapage'])) {
            $examType = 'exam';
        }

        Notification::create([
            'teacher_matricule' => $teacher->matricule,
            'exam_id' => $exam->id,
            'exam_type' => $examType,
            'message' => "Convocation pour l'examen de {$exam->module}",
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Notification sent successfully'
        ]);

    } catch (\Exception $e) {
        \Log::error('Convocation error', [
            'error' => $e->getMessage()
        ]);

        return response()->json([
            'message' => 'Error sending notification',
            'error' => $e->getMessage()
        ], 500);
    }
}



    public function getConvocationHistory($examId)
    {
        try {
            $exam = Exam::findOrFail($examId);

            $notifications = Notification::where('exam_id', $examId)
                ->where('message', 'LIKE', '%Convocation%')
                ->orderBy('created_at', 'DESC')
                ->get();

            return response()->json([
                'exam' => $exam,
                'history' => $notifications
            ]);
        } catch (\Exception $e) {
            Log::error("Error fetching convocation history: " . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching history',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}