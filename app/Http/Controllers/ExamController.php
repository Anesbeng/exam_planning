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
    $examList = Exam::where('type', 'exam')->get();
    $ccList = Exam::where('type', 'cc')->get();
    $rattrapageList = Exam::where('type', 'rattrapage')->get();
    

    return response()->json([
        'exams' => $examList,
        'ccs' => $ccList,
        'rattrapages' => $rattrapageList
    ]);}

     
 public function create()
{
    
    $modules = Module::orderBy('name')->get();
    $salle = Salle::orderBy('name')->get(); 
    
    return response()->json([
        'modules' => $modules,
        'salles' => $salle
    ]);
}

    public function store(Request $request)
{
    // Debug: Check what's being received
    
    
    Exam::create([
        'type'       => $request->type,
        'module'     => $request->module,
        'teacher'    => $request->teacher,
        'room'       => $request->room,
        'niveau'     => $request->niveau, 
        'group'      => $request->group,
        'date'       => $request->date,
        'start_time' => $request->start_time,
        'end_time'   => $request->end_time,
        'specialite'  => $request->specialite,
        'semester'  => $request->semester,
    ]);

    return response()->json([
        'message' => 'Exam created successfully'
    ]);
}

public function edit($id)
{
    $exam = Exam::findOrFail($id);
   return response()->json([
        'exam' => $exam
    ]);
}
public function update(Request $request, $id)
{
    $exam = Exam::findOrFail($id);

    $exam->update([
        'type'       => $request->type,
        'module'     => $request->module,
        'teacher'    => $request->teacher,
        'room'       => $request->room,
        'niveau'     => $request->niveau,
        'group'      => $request->group,
        'date'       => $request->date,
        'start_time' => $request->start_time,
        'end_time'   => $request->end_time,
        'specialite'  => $request->specialite,
        'semester'  => $request->semester,
    ]);

    return response()->json([
        'message' => 'Exam updated successfully'
    ]);
}
public function destroy($id)
{
    $exam = Exam::findOrFail($id);
    $exam->delete();

    return response()->json([
        'message' => 'Exam deleted successfully'
    ]);
}

public function dashboard()
{
    $examList = Exam::where('type', 'exam')->get();
    $ccList = Exam::where('type', 'cc')->get();
    $rattrapageList = Exam::where('type', 'rattrapage')->get();
    return response()->json([
        'exams' => $examList,
        'ccs' => $ccList,
        'rattrapages' => $rattrapageList
    ]);
}
}