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
    

    return view('admin.exams.index', compact('examList', 'ccList', 'rattrapageList'));
}

     
 public function create()
{
    
    $modules = Module::orderBy('name')->get();
    $salle = Salle::orderBy('name')->get(); 
    
    return view('admin.exams.create', compact('modules', 'salle'));
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

    return redirect()->route('exams.index')->with('success', 'Exam created!');
}

public function edit($id)
{
    $exam = Exam::findOrFail($id);
    return view('admin.exams.edit', compact('exam'));
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

    return redirect()->route('exams.index')->with('success', 'Exam updated!');
}
public function destroy($id)
{
    $exam = Exam::findOrFail($id);
    $exam->delete();

    return redirect()->route('exams.index')->with('success', 'Exam deleted!');
}

public function dashboard()
{
    $examList = Exam::where('type', 'exam')->get();
    $ccList = Exam::where('type', 'cc')->get();
    $rattrapageList = Exam::where('type', 'rattrapage')->get();
    return view('user.homepage', compact('examList', 'ccList', 'rattrapageList'));
}
}