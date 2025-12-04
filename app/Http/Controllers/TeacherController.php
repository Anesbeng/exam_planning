<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TeacherController extends Controller
{
   
    public function index(Request $request)
    {
        $query = User::where('role', 'teacher');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('matricule', 'like', '%' . $request->search . '%')
                  ->orWhere('specialite', 'like', '%' . $request->search . '%')
                  ->orWhere('niveau', 'like', '%' . $request->search . '%')
                  ->orWhere('groupe', 'like', '%' . $request->search . '%');
            });
        }

        $teachers = $query->get();

        return view('admin.teachers.index', compact('teachers'));
    }

    public function create()
    {
        return view('admin.teachers.create');
    }

    public function store(Request $request)
    {
        User::create([
            'matricule' => $request->matricule,
            'name' => $request->name,
            'email' => $request->email,
            'role' => 'teacher',
            'password' => $request->password,
            'specialite' => $request->specialite,
            'niveau' => 'null',
            'annee_scolaire' => 'null',
            'groupe' => 'null',
        ]);

        return redirect()->route('admin.teachers.index')
            ->with('success', 'Student added successfully');
    }

    public function edit($id)
    {
        $teacher = User::findOrFail($id);
        return view('admin.teachers.edit', compact('teacher'));
    }

    public function update(Request $request, $id)
    {
        $teacher = User::findOrFail($id);

        $teacher->update([
            'matricule' => $request->matricule,
            'name' => $request->name,
            'email' => $request->email,
            'specialite' => $request->specialite,

        ]);

        return redirect()->route('admin.teachers.index')
            ->with('success', 'Student updated successfully');
    }

    public function destroy($id)
    {
        User::findOrFail($id)->delete();

        return redirect()->route('admin.teachers.index')
            ->with('success', 'Student deleted');
    }
}

