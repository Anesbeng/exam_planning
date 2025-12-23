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
