<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Module;
use App\Models\Salle;
use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;

class ExamController extends Controller
{
    public function index()
    {
        return response()->json([
            'exams' => Exam::where('type', 'examen')->get(),
            'ccs' => Exam::where('type', 'cc')->get(),
            'rattrapages' => Exam::where('type', 'rattrapage')->get(),
        ]);
    }

    public function store(Request $request)
    {
        // Validate that the room is available for the requested date/time
        if ($request->room && $request->date && $request->start_time && $request->end_time) {
            $conflict = Exam::where('date', $request->date)
                ->where('room', $request->room)
                ->where('start_time', '<', $request->end_time)
                ->where('end_time', '>', $request->start_time)
                ->exists();

            if ($conflict) {
                return response()->json([
                    'message' => 'Room is already taken for that time'
                ], 422);
            }
        }

        // Create the exam
        $exam = Exam::create([
            'type' => $request->type,
            'module' => $request->module,
            'teacher' => $request->teacher,
            'room' => $request->room,
            'niveau' => $request->niveau,
            'group' => $request->group,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'specialite' => $request->specialite,
            'semester' => $request->semester,
        ]);

        // ✅ CREATE NOTIFICATION AFTER EXAM IS CREATED
        $this->createExamNotification($exam, $request->type, $request->teacher);

        return response()->json([
            'message' => 'Exam created successfully',
            'exam' => $exam
        ]);
    }

    public function update(Request $request, $id)
    {
        $exam = Exam::findOrFail($id);

        // Validate that the room is available (exclude current exam)
        if ($request->room && $request->date && $request->start_time && $request->end_time) {
            $conflict = Exam::where('date', $request->date)
                ->where('room', $request->room)
                ->where('id', '!=', $id)
                ->where('start_time', '<', $request->end_time)
                ->where('end_time', '>', $request->start_time)
                ->exists();

            if ($conflict) {
                return response()->json([
                    'message' => 'Room is already taken for that time'
                ], 422);
            }
        }

        // Update the exam
        $exam->update([
            'type' => $request->type,
            'module' => $request->module,
            'teacher' => $request->teacher,
            'room' => $request->room,
            'niveau' => $request->niveau,
            'group' => $request->group,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'specialite' => $request->specialite,
            'semester' => $request->semester,
        ]);

        // ✅ CREATE NOTIFICATION AFTER EXAM IS UPDATED
        $this->createExamNotification($exam, $request->type, $request->teacher);

        return response()->json([
            'message' => 'Exam updated successfully',
            'exam' => $exam
        ]);
    }

    
/**
 * Get all exams assigned to a specific teacher, grouped by type
 */
public function getTeacherExams(Request $request)
{
    $matricule = $request->query('matricule');

    if (!$matricule) {
        return response()->json(['message' => 'Matricule is required'], 400);
    }

    // Fetch exams where the teacher field matches the matricule
    $teacherExams = Exam::where('teacher', $matricule)->get();

    // Group them correctly for the frontend
    $exams = $teacherExams->where('type', 'examen')->values();
    $cc = $teacherExams->where('type', 'cc')->values();
    $rattrapage = $teacherExams->where('type', 'rattrapage')->values();

    return response()->json([
        'exams' => $exams,
        'cc' => $cc,
        'rattrapage' => $rattrapage,
    ]);
}

    public function destroy($id)
    {
        Exam::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Exam deleted successfully'
        ]);
    }

    /**
     * ✅ Create a notification for the teacher about the exam
     * This method is now properly called in store() and update()
     */
    private function createExamNotification($exam, $type, $teacherMatricule)
    {
        if (!$teacherMatricule) {
            return;
        }

        try {
            $examDate = date('d/m/Y', strtotime($exam->date));
            
            // ✅ Map exam type correctly for the database enum
            $examTypeForDb = $this->mapExamType($type);
            
            $message = "Un nouvel examen a été planifié pour le module {$exam->module} " .
                       "le {$examDate} de {$exam->start_time} à {$exam->end_time} " .
                       "en salle {$exam->room}.";

            Notification::create([
                'teacher_matricule' => $teacherMatricule,
                'exam_id' => $exam->id,
                'exam_type' => $examTypeForDb,
                'message' => $message
            ]);
        } catch (\Exception $e) {
            // Log the error but don't fail the exam creation
            Log::error('Failed to create notification: ' . $e->getMessage());
        }
    }

    /**
     * ✅ Map the exam type to match database enum values
     * Handles: 'examen' -> 'exam', 'cc' -> 'cc', 'rattrapage' -> 'rattrapage'
     */
    private function mapExamType($type)
    {
        $typeMap = [
            'examen' => 'exam',
            'exam' => 'exam',
            'cc' => 'cc',
            'rattrapage' => 'rattrapage',
        ];

        return $typeMap[strtolower($type)] ?? 'exam';
    }
}


