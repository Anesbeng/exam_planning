<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    /**
     * Create a new exam and send notification to teacher
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'type' => 'required|in:examen,cc,rattrapage',
                'module' => 'required|string',
                'teacher' => 'required|string',
                'room' => 'required|string',
                'specialite' => 'required|string',
                'niveau' => 'required|string',
                'group' => 'required|string',
                'semester' => 'required|string',
                'date' => 'required|date',
                'start_time' => 'required',
                'end_time' => 'required',
            ]);

            // Create the exam
            $exam = Exam::create($validated);

            // Find teacher by name to get matricule
            $teacher = User::where('name', $validated['teacher'])
                          ->where('role', 'teacher')
                          ->first();

            // Send notification to teacher
            if ($teacher) {
                $this->sendExamNotification($teacher->matricule, $exam, 'created');
            }

            return response()->json([
                'message' => 'Exam created successfully',
                'exam' => $exam
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating exam',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an exam and send notification to teacher
     */
    public function update(Request $request, $id)
    {
        try {
            $exam = Exam::findOrFail($id);
            
            $validated = $request->validate([
                'type' => 'required|in:examen,cc,rattrapage',
                'module' => 'required|string',
                'teacher' => 'required|string',
                'room' => 'required|string',
                'specialite' => 'required|string',
                'niveau' => 'required|string',
                'group' => 'required|string',
                'semester' => 'required|string',
                'date' => 'required|date',
                'start_time' => 'required',
                'end_time' => 'required',
            ]);

            // Check if teacher changed
            $oldTeacher = $exam->teacher;
            
            $exam->update($validated);

            // Find new teacher by name
            $teacher = User::where('name', $validated['teacher'])
                          ->where('role', 'teacher')
                          ->first();

            // Send notification to new teacher
            if ($teacher) {
                $this->sendExamNotification($teacher->matricule, $exam, 'updated');
            }

            // If teacher changed, notify old teacher about removal
            if ($oldTeacher !== $validated['teacher']) {
                $oldTeacherUser = User::where('name', $oldTeacher)
                                     ->where('role', 'teacher')
                                     ->first();
                if ($oldTeacherUser) {
                    $this->sendExamNotification($oldTeacherUser->matricule, $exam, 'removed');
                }
            }

            return response()->json([
                'message' => 'Exam updated successfully',
                'exam' => $exam
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating exam',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an exam and send notification to teacher
     */
    public function destroy($id)
    {
        try {
            $exam = Exam::findOrFail($id);
            
            // Find teacher before deleting
            $teacher = User::where('name', $exam->teacher)
                          ->where('role', 'teacher')
                          ->first();

            // Send notification before deletion
            if ($teacher) {
                $this->sendExamNotification($teacher->matricule, $exam, 'deleted');
            }

            $exam->delete();

            return response()->json([
                'message' => 'Exam deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting exam',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper function to send notifications to teachers
     */
    private function sendExamNotification($teacherMatricule, $exam, $action)
    {
        $messages = [
            'created' => "Nouvel examen ajouté : {$exam->module} le {$exam->date} à {$exam->start_time}",
            'updated' => "Examen modifié : {$exam->module} le {$exam->date} à {$exam->start_time}",
            'deleted' => "Examen supprimé : {$exam->module} qui était prévu le {$exam->date}",
            'removed' => "Vous avez été retiré de l'examen : {$exam->module}"
        ];

        try {
            Notification::create([
                'teacher_matricule' => $teacherMatricule,
                'exam_id' => $exam->id,
                'exam_type' => $exam->type,
                'message' => $messages[$action] ?? "Notification d'examen",
                'is_read' => false
            ]);
        } catch (\Exception $e) {
            // Log error but don't fail the main operation
            \Log::error("Failed to create notification: " . $e->getMessage());
        }
    }

    /**
     * Get all exams
     */
    public function index()
    {
        try {
            $exams = Exam::where('type', 'examen')->orderBy('date')->get();
            $ccs = Exam::where('type', 'cc')->orderBy('date')->get();
            $rattrapages = Exam::where('type', 'rattrapage')->orderBy('date')->get();

            return response()->json([
                'exams' => $exams,
                'ccs' => $ccs,
                'rattrapages' => $rattrapages
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching exams',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}