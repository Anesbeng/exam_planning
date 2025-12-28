<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Module;
use App\Models\Salle;
use Illuminate\Http\Request;

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

        Exam::create([
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

        return response()->json([
            'message' => 'Exam created successfully'
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

        return response()->json([
            'message' => 'Exam updated successfully'
        ]);
    }

    public function destroy($id)
    {
        Exam::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Exam deleted successfully'
        ]);
    }
}
