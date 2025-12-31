<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Module;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ExamController extends Controller
{
    /**
     * Map exam types from frontend to database format
     */
    private function mapExamTypeToDb($type)
    {
        $mapping = [
            'examen' => 'exam',
            'cc' => 'cc',
            'rattrapage' => 'rattrapage'
        ];
        return $mapping[$type] ?? $type;
    }

    /**
     * Create a new exam and send notification to teacher
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        
        try {
            Log::info("🚀 Starting exam creation process");
            Log::info("📦 Request data: ", $request->all());
            
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

            Log::info("✅ Validation passed");

            // Find surveillant teacher
            $surveillant = User::where('name', $validated['teacher'])
                          ->where('role', 'teacher')
                          ->first();

            if (!$surveillant) {
                Log::error("❌ Teacher not found: " . $validated['teacher']);
                DB::rollBack();
                return response()->json([
                    'message' => 'Enseignant surveillant non trouvé: ' . $validated['teacher']
                ], 404);
            }

            Log::info("👤 Teacher found: {$surveillant->name} (matricule: {$surveillant->matricule})");

            // Find module
            $module = Module::where('name', $validated['module'])->first();

            if (!$module) {
                Log::error("❌ Module not found: " . $validated['module']);
                DB::rollBack();
                return response()->json([
                    'message' => 'Module non trouvé'
                ], 404);
            }

            Log::info("📚 Module found: {$module->name}");

            // Check if surveillant is the module responsible
            if ($module->teacher_responsible === $surveillant->matricule) {
                Log::warning("⚠️ Teacher is module responsible");
                DB::rollBack();
                return response()->json([
                    'message' => 'Le responsable du module ne peut pas être assigné comme surveillant pour cet examen.'
                ], 400);
            }

            // Check room availability
            $roomTaken = Exam::where('date', $validated['date'])
                ->where('start_time', '<', $validated['end_time'])
                ->where('end_time', '>', $validated['start_time'])
                ->where('room', $validated['room'])
                ->exists();

            if ($roomTaken) {
                Log::warning("⚠️ Room already taken");
                DB::rollBack();
                return response()->json([
                    'message' => 'La salle est déjà prise à cette heure.'
                ], 400);
            }

            // Check teacher availability
            $teacherTaken = Exam::where('date', $validated['date'])
                ->where('start_time', '<', $validated['end_time'])
                ->where('end_time', '>', $validated['start_time'])
                ->where('teacher', $validated['teacher'])
                ->exists();

            if ($teacherTaken) {
                Log::warning("⚠️ Teacher already has exam at this time");
                DB::rollBack();
                return response()->json([
                    'message' => 'L\'enseignant a déjà un examen prévu à cette heure.'
                ], 400);
            }

            // Create the exam
            $exam = Exam::create($validated);
            Log::info("✅ Exam created successfully with ID: {$exam->id}");

            // Create notification with mapped exam type
            try {
                Log::info("📧 Attempting to create notification...");
                Log::info("📧 Teacher matricule: {$surveillant->matricule}");
                Log::info("📧 Exam ID: {$exam->id}");
                Log::info("📧 Exam type (original): {$exam->type}");
                
                // Map exam type to database format
                $dbExamType = $this->mapExamTypeToDb($exam->type);
                Log::info("📧 Exam type (mapped for DB): {$dbExamType}");
                
                $notificationData = [
                    'teacher_matricule' => $surveillant->matricule,
                    'exam_id' => $exam->id,
                    'exam_type' => $dbExamType, // Use mapped type
                    'message' => "Nouvel examen ajouté : {$exam->module} le {$exam->date} à {$exam->start_time}",
                    'is_read' => false
                ];
                
                Log::info("📧 Notification data: ", $notificationData);
                
                $notification = Notification::create($notificationData);
                
                Log::info("✅✅✅ NOTIFICATION CREATED SUCCESSFULLY!");
                Log::info("✅ Notification ID: {$notification->id}");
                Log::info("✅ Notification message: {$notification->message}");
                
            } catch (\Exception $notifError) {
                Log::error("❌❌❌ NOTIFICATION CREATION FAILED!");
                Log::error("Error message: " . $notifError->getMessage());
                Log::error("Error trace: " . $notifError->getTraceAsString());
            }

            DB::commit();
            
            Log::info("🎉 Exam creation process completed successfully");

            return response()->json([
                'message' => 'Exam created successfully',
                'exam' => $exam,
                'notification_created' => isset($notification) && $notification->id ? true : false
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("❌ EXAM CREATION FAILED!");
            Log::error("Error: " . $e->getMessage());
            Log::error("Trace: " . $e->getTraceAsString());
            
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
        DB::beginTransaction();
        
        try {
            Log::info("🔄 Starting exam update process for ID: {$id}");
            
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

            $surveillant = User::where('name', $validated['teacher'])
                          ->where('role', 'teacher')
                          ->first();

            if (!$surveillant) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Enseignant surveillant non trouvé'
                ], 404);
            }

            $module = Module::where('name', $validated['module'])->first();

            if (!$module) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Module non trouvé'
                ], 404);
            }

            if ($module->teacher_responsible === $surveillant->matricule) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Le responsable du module ne peut pas être assigné comme surveillant pour cet examen.'
                ], 400);
            }

            $roomTaken = Exam::where('date', $validated['date'])
                ->where('start_time', '<', $validated['end_time'])
                ->where('end_time', '>', $validated['start_time'])
                ->where('room', $validated['room'])
                ->where('id', '!=', $id)
                ->exists();

            if ($roomTaken) {
                DB::rollBack();
                return response()->json([
                    'message' => 'La salle est déjà prise à cette heure.'
                ], 400);
            }

            $teacherTaken = Exam::where('date', $validated['date'])
                ->where('start_time', '<', $validated['end_time'])
                ->where('end_time', '>', $validated['start_time'])
                ->where('teacher', $validated['teacher'])
                ->where('id', '!=', $id)
                ->exists();

            if ($teacherTaken) {
                DB::rollBack();
                return response()->json([
                    'message' => 'L\'enseignant a déjà un examen prévu à cette heure.'
                ], 400);
            }

            $oldTeacher = $exam->teacher;
            $exam->update($validated);

            // Notify new teacher with mapped exam type
            try {
                $dbExamType = $this->mapExamTypeToDb($exam->type);
                
                Notification::create([
                    'teacher_matricule' => $surveillant->matricule,
                    'exam_id' => $exam->id,
                    'exam_type' => $dbExamType,
                    'message' => "Examen modifié : {$exam->module} le {$exam->date} à {$exam->start_time}",
                    'is_read' => false
                ]);
                Log::info("✅ Update notification sent to: {$surveillant->matricule}");
            } catch (\Exception $e) {
                Log::error("❌ Failed to send update notification: " . $e->getMessage());
            }

            // If teacher changed, notify old teacher
            if ($oldTeacher !== $validated['teacher']) {
                $oldTeacherUser = User::where('name', $oldTeacher)
                                     ->where('role', 'teacher')
                                     ->first();
                if ($oldTeacherUser) {
                    try {
                        $dbExamType = $this->mapExamTypeToDb($exam->type);
                        
                        Notification::create([
                            'teacher_matricule' => $oldTeacherUser->matricule,
                            'exam_id' => $exam->id,
                            'exam_type' => $dbExamType,
                            'message' => "Vous avez été retiré de l'examen : {$exam->module}",
                            'is_read' => false
                        ]);
                        Log::info("✅ Removal notification sent to old teacher: {$oldTeacherUser->matricule}");
                    } catch (\Exception $e) {
                        Log::error("❌ Failed to send removal notification: " . $e->getMessage());
                    }
                }
            }

            DB::commit();
            Log::info("✅ Exam updated successfully");

            return response()->json([
                'message' => 'Exam updated successfully',
                'exam' => $exam
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("❌ Exam update failed: " . $e->getMessage());
            
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
        DB::beginTransaction();
        
        try {
            Log::info("🗑️ Starting exam deletion for ID: {$id}");
            
            $exam = Exam::findOrFail($id);
            $teacher = User::where('name', $exam->teacher)
                          ->where('role', 'teacher')
                          ->first();

            if ($teacher) {
                try {
                    $dbExamType = $this->mapExamTypeToDb($exam->type);
                    
                    Notification::create([
                        'teacher_matricule' => $teacher->matricule,
                        'exam_id' => $exam->id,
                        'exam_type' => $dbExamType,
                        'message' => "Examen supprimé : {$exam->module} qui était prévu le {$exam->date}",
                        'is_read' => false
                    ]);
                    Log::info("✅ Deletion notification sent to: {$teacher->matricule}");
                } catch (\Exception $e) {
                    Log::error("❌ Failed to send deletion notification: " . $e->getMessage());
                }
            }

            $exam->delete();
            DB::commit();
            
            Log::info("✅ Exam deleted successfully");

            return response()->json([
                'message' => 'Exam deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("❌ Exam deletion failed: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Error deleting exam',
                'error' => $e->getMessage()
            ], 500);
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
            Log::error("❌ Error fetching exams: " . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching exams',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}