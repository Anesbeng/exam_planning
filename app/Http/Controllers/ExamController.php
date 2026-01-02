<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Module;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ExamController extends Controller
{
    /**
     * Map exam types from frontend to database format
     */
    private function mapExamTypeToDb($type)
    {
        $mapping = [
            'examen' => 'examen',
            'cc' => 'cc',
            'rattrapage' => 'rattrapage'
        ];
        return $mapping[$type] ?? $type;
    }

    /**
     * Check if teacher is module responsible
     * Handles both matricule and name comparison (for mixed data)
     */
    private function isTeacherModuleResponsible($teacherMatricule, $teacherName, $moduleResponsible)
    {
        if (empty($moduleResponsible)) {
            return false;
        }

        // Check both matricule and name (strict comparison)
        return ($teacherMatricule === $moduleResponsible) || ($teacherName === $moduleResponsible);
    }

    /**
     * Check if a teacher has a scheduling conflict
     */
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

    /**
     * ✅ FIXED: Create notification with proper error handling
     */
    private function createNotification($surveillant, $exam, $messagePrefix = "Nouvel examen ajouté")
    {
        try {
            // ✅ CRITICAL CHECK: Validate matricule exists
            if (empty($surveillant->matricule)) {
                Log::error("❌ NOTIFICATION SKIPPED: Teacher has NO MATRICULE!", [
                    'teacher_id' => $surveillant->id,
                    'teacher_name' => $surveillant->name,
                    'teacher_email' => $surveillant->email,
                    'matricule_value' => $surveillant->matricule ?? 'NULL'
                ]);
                return false;
            }

            $dbExamType = $this->mapExamTypeToDb($exam->type);
            
            $notificationData = [
                'teacher_matricule' => $surveillant->matricule,
                'exam_id' => $exam->id,
                'exam_type' => $dbExamType,
                'message' => "{$messagePrefix} : {$exam->module} le {$exam->date} à {$exam->start_time}",
                'is_read' => false
            ];
            
            Log::info("📝 Creating notification with data:", $notificationData);
            
            $notification = Notification::create($notificationData);
            
            Log::info("✅ Notification created successfully!", [
                'notification_id' => $notification->id,
                'teacher_name' => $surveillant->name,
                'teacher_matricule' => $surveillant->matricule,
                'exam_id' => $exam->id,
                'message' => $notificationData['message']
            ]);
            
            return true;
            
        } catch (\Exception $notifError) {
            Log::error("❌ NOTIFICATION CREATION FAILED!");
            Log::error("Error message: " . $notifError->getMessage());
            Log::error("Error code: " . $notifError->getCode());
            Log::error("Teacher info:", [
                'id' => $surveillant->id ?? 'N/A',
                'name' => $surveillant->name ?? 'N/A',
                'email' => $surveillant->email ?? 'N/A',
                'matricule' => $surveillant->matricule ?? 'NULL',
                'has_matricule' => !empty($surveillant->matricule)
            ]);
            Log::error("Notification data attempted:", $notificationData ?? []);
            Log::error("Full error details:", [
                'file' => $notifError->getFile(),
                'line' => $notifError->getLine(),
                'trace' => $notifError->getTraceAsString()
            ]);
            
            return false;
        }
    }

    /**
     * ✅ FIXED: Create a new exam with improved error handling
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        
        try {
            Log::info("🚀 Starting exam creation process");
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
                DB::rollBack();
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

            Log::info("👤 Surveillant found:", [
                'id' => $surveillant->id,
                'name' => $surveillant->name,
                'matricule' => $surveillant->matricule ?? 'NULL',
                'email' => $surveillant->email
            ]);

            // ✅ NEW: Check if teacher has matricule (don't fail, just warn)
            $hasMatricule = !empty($surveillant->matricule);
            if (!$hasMatricule) {
                Log::warning("⚠️ WARNING: Teacher has no matricule - notification will NOT be sent!", [
                    'teacher_name' => $surveillant->name,
                    'teacher_id' => $surveillant->id
                ]);
            }

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

            Log::info("📚 Module: {$module->name}, Responsible: '{$module->teacher_responsible}'");

            // ⭐ CRITICAL CHECK: Compare BOTH matricule and name
            if ($this->isTeacherModuleResponsible($surveillant->matricule, $surveillant->name, $module->teacher_responsible)) {
                Log::warning("⚠️ BLOCKED: {$surveillant->name} is module responsible for {$module->name}");
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Le responsable du module ne peut pas être assigné comme surveillant pour cet examen.'
                ], 400);
            }

            Log::info("✅ Teacher is NOT module responsible - proceeding");

            // Check teacher conflict
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

            // ✅ FIXED: Create notification with improved error handling
            $notificationCreated = $this->createNotification($surveillant, $exam, "Nouvel examen ajouté");

            DB::commit();
            Log::info("🎉 Exam creation process completed successfully");

            $responseData = [
                'success' => true,
                'message' => 'Exam created successfully',
                'exam' => $exam,
                'notification_created' => $notificationCreated
            ];

            // ✅ Add warning if notification wasn't created
            if (!$notificationCreated) {
                $responseData['warning'] = "L'examen a été créé mais la notification n'a pas pu être envoyée (l'enseignant n'a pas de matricule).";
                Log::warning("⚠️ Exam created but notification NOT sent");
            }

            return response()->json($responseData, 201);

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

    /**
     * ✅ FIXED: Update exam with improved notification handling
     */
    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        
        try {
            Log::info("🔄 Starting exam update");
            Log::info('Update exam request:', ['id' => $id, 'data' => $request->all()]);

            $exam = Exam::find($id);
            
            if (!$exam) {
                Log::error('Exam not found for update:', ['id' => $id]);
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Exam not found'
                ], 404);
            }

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
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();

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

            Log::info("📚 Module: {$module->name}, Responsible: '{$module->teacher_responsible}'");
            Log::info("👤 Surveillant: {$surveillant->name}, Matricule: " . ($surveillant->matricule ?? 'NULL'));

            // ⭐ CRITICAL CHECK: Compare BOTH matricule and name
            if ($this->isTeacherModuleResponsible($surveillant->matricule, $surveillant->name, $module->teacher_responsible)) {
                Log::warning("⚠️ BLOCKED: Teacher is module responsible");
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

            // Check room availability
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

            $oldTeacher = $exam->teacher;
            $exam->update($validated);
            Log::info('Exam updated successfully');

            // ✅ FIXED: Notify new teacher with improved error handling
            $notificationSent = $this->createNotification($surveillant, $exam, "Examen modifié");

            // If teacher changed, notify old teacher
            if ($oldTeacher !== $validated['teacher']) {
                $oldTeacherUser = User::where('name', $oldTeacher)->where('role', 'teacher')->first();
                if ($oldTeacherUser) {
                    $this->createNotification($oldTeacherUser, $exam, "Vous avez été retiré de l'examen");
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Exam updated successfully',
                'exam' => $exam,
                'notification_sent' => $notificationSent
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update error:', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error updating exam',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ FIXED: Delete exam with improved notification handling
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        
        try {
            $exam = Exam::find($id);
            
            if (!$exam) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Exam not found'
                ], 404);
            }

            $teacher = User::where('name', $exam->teacher)->where('role', 'teacher')->first();

            if ($teacher) {
                $this->createNotification($teacher, $exam, "Examen supprimé");
            }

            $exam->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Exam deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error deleting exam',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        try {
            return response()->json([
                'success' => true,
                'exams' => Exam::where('type', 'examen')->orderBy('date')->get(),
                'ccs' => Exam::where('type', 'cc')->orderBy('date')->get(),
                'rattrapages' => Exam::where('type', 'rattrapage')->orderBy('date')->get()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching exams',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $exam = Exam::find($id);
        
        if (!$exam) {
            return response()->json(['success' => false, 'message' => 'Exam not found'], 404);
        }

        return response()->json(['success' => true, 'exam' => $exam]);
    }

    /**
     * ✅ FIXED: Bulk delete with improved notification handling
     */
    public function bulkDelete(Request $request)
    {
        DB::beginTransaction();
        
        try {
            $validator = Validator::make($request->all(), [
                'exam_ids' => 'required|array',
                'exam_ids.*' => 'exists:exams,id'
            ]);

            if ($validator->fails()) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $exams = Exam::whereIn('id', $request->exam_ids)->get();

            foreach ($exams as $exam) {
                $teacher = User::where('name', $exam->teacher)->where('role', 'teacher')->first();
                if ($teacher) {
                    $this->createNotification($teacher, $exam, "Examen supprimé");
                }
                $exam->delete();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($exams) . ' exam(s) deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error deleting exams',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available teachers - EXCLUDES MODULE RESPONSIBLE (both matricule and name)
     */
    public function getAvailableTeachers(Request $request)
    {
        try {
            Log::info("🔍 Getting available teachers with params:", $request->all());
            
            $validator = Validator::make($request->all(), [
                'date' => 'required|date',
                'start_time' => 'required',
                'end_time' => 'required',
                'module' => 'nullable|string',
                'exclude_teacher' => 'nullable|string',
                'exclude_exam_id' => 'nullable|integer'
            ]);

            if ($validator->fails()) {
                Log::error("❌ Validation failed:", $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            // Get module responsible
            $moduleResponsibleValue = null;
            $moduleName = null;
            
            if (!empty($data['module'])) {
                $module = Module::where('name', $data['module'])->first();
                if ($module) {
                    $moduleResponsibleValue = $module->teacher_responsible;
                    $moduleName = $module->name;
                    Log::info("📚 Module: '{$module->name}', Responsible: '{$moduleResponsibleValue}'");
                }
            }

            $allTeachers = User::where('role', 'teacher')->get();
            $availableTeachers = [];
            $excludedTeachers = [];

            foreach ($allTeachers as $teacher) {
                // Skip if excluded by name
                if (!empty($data['exclude_teacher']) && $teacher->name === $data['exclude_teacher']) {
                    $excludedTeachers[] = [
                        'name' => $teacher->name,
                        'reason' => 'excluded by name'
                    ];
                    continue;
                }

                // ⭐ CRITICAL: Check if module responsible (both matricule AND name)
                if ($moduleResponsibleValue && $this->isTeacherModuleResponsible($teacher->matricule, $teacher->name, $moduleResponsibleValue)) {
                    Log::info("⚠️ Excluding {$teacher->name} - module responsible for '{$moduleName}'");
                    $excludedTeachers[] = [
                        'name' => $teacher->name,
                        'reason' => "responsible for module '{$moduleName}'"
                    ];
                    continue;
                }

                // Check scheduling conflicts
                $hasConflict = $this->teacherHasConflict(
                    $teacher->name,
                    $data['date'],
                    $data['start_time'],
                    $data['end_time'],
                    $data['exclude_exam_id'] ?? null
                );

                if ($hasConflict) {
                    $excludedTeachers[] = [
                        'name' => $teacher->name,
                        'reason' => 'scheduling conflict'
                    ];
                    continue;
                }

                // Available!
                $availableTeachers[] = [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'email' => $teacher->email,
                    'matricule' => $teacher->matricule
                ];
            }

            Log::info("✅ Available: " . count($availableTeachers) . ", Excluded: " . count($excludedTeachers));

            return response()->json([
                'success' => true,
                'available_teachers' => $availableTeachers,
                'total_available' => count($availableTeachers),
                'total_excluded' => count($excludedTeachers),
                'excluded_teachers' => $excludedTeachers
            ]);
        } catch (\Exception $e) {
            Log::error("❌ Error: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error getting available teachers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function notifyTeacher($examId)
    {
        try {
            $exam = Exam::find($examId);
            
            if (!$exam) {
                return response()->json(['success' => false, 'message' => 'Exam not found'], 404);
            }

            $teacher = User::where('name', $exam->teacher)->where('role', 'teacher')->first();

            if (!$teacher) {
                return response()->json(['success' => false, 'message' => 'Teacher not found'], 404);
            }

            // ✅ Use the new createNotification method
            $notificationSent = $this->createNotification(
                $teacher, 
                $exam, 
                "Rappel : examen {$exam->module} le {$exam->date} à {$exam->start_time} en salle {$exam->room}"
            );

            if ($notificationSent) {
                return response()->json([
                    'success' => true,
                    'message' => 'Notification sent successfully to ' . $teacher->name
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send notification (teacher may not have a matricule)'
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error sending notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}