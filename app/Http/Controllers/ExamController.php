<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ExamController extends Controller
{
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

        // Check teacher conflict
        if ($this->teacherHasConflict(
            $validated['teacher'],
            $validated['date'],
            $validated['start_time'],
            $validated['end_time']
        )) {
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
            return response()->json([
                'success' => false,
                'message' => 'Conflit : cette salle est déjà occupée à ce créneau.'
            ], 422);
        }

        // Create the exam
        $exam = Exam::create($validated);

        // Send notification to teacher
        $teacher = User::where('name', $validated['teacher'])->first();
        if ($teacher) {
            $this->sendExamNotification($teacher->matricule, $exam, 'created');
        }

        return response()->json([
            'success' => true,
            'message' => 'Exam created successfully',
            'exam' => $exam
        ], 201);
    }

    /* =====================================================
        UPDATE EXAM - WITH CONFLICT CHECKING
    ===================================================== */
    public function update(Request $request, $id)
    {
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

            // Use simpler validation like in old controller
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

            Log::info('Validation passed:', $validated);

            // Check teacher conflict (exclude current exam)
            if ($this->teacherHasConflict(
                $validated['teacher'],
                $validated['date'],
                $validated['start_time'],
                $validated['end_time'],
                $exam->id
            )) {
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

            // Send notifications
            $newTeacher = User::where('name', $validated['teacher'])->first();
            if ($newTeacher) {
                $this->sendExamNotification($newTeacher->matricule, $exam, 'updated');
            }

            if ($oldTeacher !== $validated['teacher']) {
                $oldTeacherUser = User::where('name', $oldTeacher)->first();
                if ($oldTeacherUser) {
                    $this->sendExamNotification($oldTeacherUser->matricule, $exam, 'removed');
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Exam updated successfully',
                'exam' => $exam
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Update validation exception:', [
                'errors' => $e->errors(),
                'data' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
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
            $teacher = User::where('name', $exam->teacher)->first();
            if ($teacher) {
                $this->sendExamNotification($teacher->matricule, $exam, 'deleted');
            }

            $exam->delete();

            return response()->json([
                'success' => true,
                'message' => 'Exam deleted successfully'
            ]);

        } catch (\Exception $e) {
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
        NOTIFICATIONS
    ===================================================== */
    private function sendExamNotification($matricule, $exam, $action)
    {
        $messages = [
            'created' => "New exam added: {$exam->module} on {$exam->date} at {$exam->start_time}",
            'updated' => "Exam updated: {$exam->module} on {$exam->date} at {$exam->start_time}",
            'deleted' => "Exam deleted: {$exam->module} scheduled for {$exam->date}",
            'removed' => "You have been removed from exam: {$exam->module}"
        ];

        try {
            Notification::create([
                'teacher_matricule' => $matricule,
                'exam_id' => $exam->id,
                'exam_type' => $exam->type,
                'message' => $messages[$action] ?? "Exam notification",
                'is_read' => false
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to create notification: " . $e->getMessage());
        }
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
            $teacher = User::where('name', $exam->teacher)->first();
            if ($teacher) {
                $this->sendExamNotification($teacher->matricule, $exam, 'deleted');
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

            // Send notifications
            $newTeacher = User::where('name', $validated['teacher'])->first();
            if ($newTeacher) {
                $this->sendExamNotification($newTeacher->matricule, $exam, 'updated');
            }

            if ($oldTeacher !== $validated['teacher']) {
                $oldTeacherUser = User::where('name', $oldTeacher)->first();
                if ($oldTeacherUser) {
                    $this->sendExamNotification($oldTeacherUser->matricule, $exam, 'removed');
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