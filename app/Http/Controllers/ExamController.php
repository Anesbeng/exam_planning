<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Module;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
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

    /* =====================================================
        HELPER : CHECK TEACHER CONFLICT - FIXED VERSION
    ===================================================== */
    private function teacherHasConflict(
        string $teacher,
        string $date,
        string $start,
        string $end,
        $excludeExamId = null
    ) {
        Log::info('Checking teacher conflict:', [
            'teacher' => $teacher,
            'date' => $date,
            'start' => $start,
            'end' => $end,
            'excludeExamId' => $excludeExamId
        ]);

        $query = Exam::where('teacher', $teacher)
            ->where('date', $date)
            ->when($excludeExamId, function ($q) use ($excludeExamId) {
                $q->where('id', '!=', $excludeExamId);
            })
            ->where(function ($q) use ($start, $end) {
                // Check if new exam starts during existing exam
                $q->where(function ($q) use ($start, $end) {
                    $q->where('start_time', '<', $end)
                      ->where('end_time', '>', $start);
                });
            });

        $hasConflict = $query->exists();
        
        if ($hasConflict) {
            $conflictingExams = $query->get(['id', 'module', 'start_time', 'end_time']);
            Log::warning('Teacher conflict found:', [
                'teacher' => $teacher,
                'date' => $date,
                'conflicts' => $conflictingExams->toArray()
            ]);
        }

        return $hasConflict;
    }

    /* =====================================================
        CREATE EXAM
    ===================================================== */
    public function store(Request $request)
    {
        DB::beginTransaction();
        
        try {
            Log::info('Store exam request:', $request->all());

            $validator = Validator::make($request->all(), [
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

            if ($validator->fails()) {
                Log::error('Store validation failed:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();
            Log::info("✅ Validation passed");

            // Find surveillant teacher
            $surveillant = User::where('name', $validated['teacher'])
                          ->where('role', 'teacher')
                          ->first();

            if (!$surveillant) {
                Log::error("❌ Teacher not found: " . $validated['teacher']);
                DB::rollBack();
                return response()->json([
                    'success' => false,
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
                    'success' => false,
                    'message' => 'Module non trouvé'
                ], 404);
            }

            Log::info("📚 Module found: {$module->name}");

            // Check if surveillant is the module responsible
            if ($module->teacher_responsible === $surveillant->matricule) {
                Log::warning("⚠️ Teacher is module responsible");
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Le responsable du module ne peut pas être assigné comme surveillant pour cet examen.'
                ], 400);
            }

            // Check teacher conflict using the improved helper
            if ($this->teacherHasConflict(
                $validated['teacher'],
                $validated['date'],
                $validated['start_time'],
                $validated['end_time']
            )) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Conflit : cet enseignant est déjà surveillant à ce créneau.'
                ], 422);
            }

            // Check room availability
            $roomConflict = Exam::where('room', $validated['room'])
                ->where('date', $validated['date'])
                ->where(function ($q) use ($validated) {
                    $q->where(function ($q) use ($validated) {
                        $q->where('start_time', '<', $validated['end_time'])
                          ->where('end_time', '>', $validated['start_time']);
                    });
                })
                ->exists();

            if ($roomConflict) {
                Log::warning("⚠️ Room already taken");
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Conflit : cette salle est déjà occupée à ce créneau.'
                ], 422);
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
                'success' => true,
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
                'success' => false,
                'message' => 'Error creating exam',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /* =====================================================
        UPDATE EXAM - WITH CONFLICT CHECKING
    ===================================================== */
    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        
        try {
            Log::info('Update exam request:', [
                'id' => $id,
                'data' => $request->all()
            ]);

            // First, find the exam
            $exam = Exam::find($id);
            
            if (!$exam) {
                Log::error('Exam not found for update:', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Exam not found'
                ], 404);
            }

            Log::info('Found exam:', $exam->toArray());

            // Use validation
            $validator = Validator::make($request->all(), [
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

            if ($validator->fails()) {
                Log::error('Update validation failed:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();
            Log::info('Validation passed:', $validated);

            // Find surveillant teacher
            $surveillant = User::where('name', $validated['teacher'])
                          ->where('role', 'teacher')
                          ->first();

            if (!$surveillant) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Enseignant surveillant non trouvé'
                ], 404);
            }

            // Find module
            $module = Module::where('name', $validated['module'])->first();

            if (!$module) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Module non trouvé'
                ], 404);
            }

            // Check if surveillant is the module responsible
            if ($module->teacher_responsible === $surveillant->matricule) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Le responsable du module ne peut pas être assigné comme surveillant pour cet examen.'
                ], 400);
            }

            // Check teacher conflict (exclude current exam)
            if ($this->teacherHasConflict(
                $validated['teacher'],
                $validated['date'],
                $validated['start_time'],
                $validated['end_time'],
                $exam->id
            )) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Conflit : cet enseignant est déjà surveillant à ce créneau.'
                ], 422);
            }

            // Check room availability (exclude current exam)
            $roomConflict = Exam::where('room', $validated['room'])
                ->where('date', $validated['date'])
                ->where('id', '!=', $exam->id)
                ->where(function ($q) use ($validated) {
                    $q->where(function ($q) use ($validated) {
                        $q->where('start_time', '<', $validated['end_time'])
                          ->where('end_time', '>', $validated['start_time']);
                    });
                })
                ->exists();

            if ($roomConflict) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Conflit : cette salle est déjà occupée à ce créneau.'
                ], 422);
            }

            // Save old teacher name
            $oldTeacher = $exam->teacher;
            
            // Update the exam
            $exam->update($validated);
            Log::info('Exam updated successfully');

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
                $oldTeacherUser = User::where('name', $oldTeacher)->first();
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
                'success' => true,
                'message' => 'Exam updated successfully',
                'exam' => $exam
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error updating exam',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /* =====================================================
        DELETE EXAM
    ===================================================== */
    public function destroy($id)
    {
        DB::beginTransaction();
        
        try {
            Log::info('Delete exam request:', ['id' => $id]);

            $exam = Exam::find($id);
            
            if (!$exam) {
                return response()->json([
                    'success' => false,
                    'message' => 'Exam not found'
                ], 404);
            }

            // Send notification
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
                'success' => true,
                'message' => 'Exam deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Delete error:', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error deleting exam',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /* =====================================================
        AUTO ASSIGN TEACHER
    ===================================================== */
    public function autoAssign(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'exclude_teacher' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        $teachers = User::where('role', 'teacher')->get();

        foreach ($teachers as $teacher) {
            if (!empty($data['exclude_teacher']) && $teacher->name === $data['exclude_teacher']) {
                continue;
            }

            $hasConflict = $this->teacherHasConflict(
                $teacher->name,
                $data['date'],
                $data['start_time'],
                $data['end_time']
            );

            if (!$hasConflict) {
                return response()->json([
                    'success' => true,
                    'teacher' => $teacher->name,
                    'teacher_id' => $teacher->id,
                    'message' => 'Teacher found successfully'
                ]);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'No available teacher for this period',
            'teacher' => null
        ], 200);
    }

    /* =====================================================
        GET TEACHER AVAILABILITY
    ===================================================== */
    public function checkTeacherAvailability(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'teacher' => 'required|string',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'exclude_exam_id' => 'nullable|integer|exists:exams,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        $hasConflict = $this->teacherHasConflict(
            $data['teacher'],
            $data['date'],
            $data['start_time'],
            $data['end_time'],
            $data['exclude_exam_id'] ?? null
        );

        return response()->json([
            'success' => true,
            'available' => !$hasConflict,
            'has_conflict' => $hasConflict
        ]);
    }

    /* =====================================================
        LIST EXAMS
    ===================================================== */
    public function index()
    {
        try {
            $exams = Exam::where('type', 'examen')->orderBy('date')->get();
            $ccs = Exam::where('type', 'cc')->orderBy('date')->get();
            $rattrapages = Exam::where('type', 'rattrapage')->orderBy('date')->get();

            return response()->json([
                'success' => true,
                'exams' => $exams,
                'ccs' => $ccs,
                'rattrapages' => $rattrapages
            ]);
        } catch (\Exception $e) {
            Log::error("❌ Error fetching exams: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching exams',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /* =====================================================
        GET EXAM BY ID
    ===================================================== */
    public function show($id)
    {
        $exam = Exam::find($id);
        
        if (!$exam) {
            return response()->json([
                'success' => false,
                'message' => 'Exam not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'exam' => $exam
        ]);
    }

    /* =====================================================
        BULK DELETE
    ===================================================== */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'exam_ids' => 'required|array',
            'exam_ids.*' => 'exists:exams,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $exams = Exam::whereIn('id', $request->exam_ids)->get();

        foreach ($exams as $exam) {
            // Send notification with mapped exam type
            $teacher = User::where('name', $exam->teacher)->first();
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
                } catch (\Exception $e) {
                    Log::error("Failed to send bulk delete notification: " . $e->getMessage());
                }
            }
            $exam->delete();
        }

        return response()->json([
            'success' => true,
            'message' => count($exams) . ' exam(s) deleted successfully'
        ]);
    }

    /* =====================================================
        GET AVAILABLE TEACHERS
    ===================================================== */
    public function getAvailableTeachers(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'exclude_teacher' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        $allTeachers = User::where('role', 'teacher')->get();
        $availableTeachers = [];

        foreach ($allTeachers as $teacher) {
            if (!empty($data['exclude_teacher']) && $teacher->name === $data['exclude_teacher']) {
                continue;
            }

            $hasConflict = $this->teacherHasConflict(
                $teacher->name,
                $data['date'],
                $data['start_time'],
                $data['end_time']
            );

            if (!$hasConflict) {
                $availableTeachers[] = [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'email' => $teacher->email,
                    'matricule' => $teacher->matricule
                ];
            }
        }

        return response()->json([
            'success' => true,
            'available_teachers' => $availableTeachers,
            'total_available' => count($availableTeachers)
        ]);
    }

    /* =====================================================
        DEBUG: DISABLE CONFLICT CHECKING FOR TESTING
    ===================================================== */
    public function updateWithoutConflictCheck(Request $request, $id)
    {
        try {
            Log::info('Update WITHOUT conflict check:', [
                'id' => $id,
                'data' => $request->all()
            ]);

            $exam = Exam::find($id);
            
            if (!$exam) {
                return response()->json([
                    'success' => false,
                    'message' => 'Exam not found'
                ], 404);
            }

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

            $oldTeacher = $exam->teacher;
            $exam->update($validated);

            // Send notifications with mapped exam types
            $newTeacher = User::where('name', $validated['teacher'])->first();
            if ($newTeacher) {
                try {
                    $dbExamType = $this->mapExamTypeToDb($exam->type);
                    
                    Notification::create([
                        'teacher_matricule' => $newTeacher->matricule,
                        'exam_id' => $exam->id,
                        'exam_type' => $dbExamType,
                        'message' => "Examen modifié : {$exam->module} le {$exam->date} à {$exam->start_time}",
                        'is_read' => false
                    ]);
                } catch (\Exception $e) {
                    Log::error("Failed to send update notification: " . $e->getMessage());
                }
            }

            if ($oldTeacher !== $validated['teacher']) {
                $oldTeacherUser = User::where('name', $oldTeacher)->first();
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
                    } catch (\Exception $e) {
                        Log::error("Failed to send removal notification: " . $e->getMessage());
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Exam updated successfully (no conflict check)',
                'exam' => $exam
            ]);

        } catch (\Exception $e) {
            Log::error('Update without conflict check error:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error updating exam',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}