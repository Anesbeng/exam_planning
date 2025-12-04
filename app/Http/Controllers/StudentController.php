<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    // 1️⃣ LIST STUDENTS
    public function index(Request $request)
    {
        $query = User::where('role', 'student');

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

        $students = $query->get();

        return view('admin.students.index', compact('students'));
    }

    // 2️⃣ SHOW ADD FORM
    public function create()
    {
        return view('admin.students.create');
    }

    // 3️⃣ SAVE NEW STUDENT
    public function store(Request $request)
    {
        User::create([
            'matricule' => $request->matricule,
            'name' => $request->name,
            'email' => $request->email,
            'role' => 'student',
            'password' => $request->password,
            'specialite' => $request->specialite,
            'niveau' => $request->niveau,
            'annee_scolaire' => $request->annee_scolaire,
            'groupe' => $request->groupe,
        ]);

        return redirect()->route('admin.students.index')
            ->with('success', 'Student added successfully');
    }

    // 4️⃣ SHOW EDIT FORM
    public function edit($id)
    {
        $student = User::findOrFail($id);
        return view('admin.students.edit', compact('student'));
    }

    // 5️⃣ UPDATE STUDENT
    public function update(Request $request, $id)
    {
        $student = User::findOrFail($id);

        $student->update([
            'matricule' => $request->matricule,
            'name' => $request->name,
            'email' => $request->email,
            'specialite' => $request->specialite,
            'niveau' => $request->niveau,
            'annee_scolaire' => $request->annee_scolaire,
            'groupe' => $request->groupe,
        ]);

        return redirect()->route('admin.students.index')
            ->with('success', 'Student updated successfully');
    }

    // 6️⃣ DELETE STUDENT
    public function destroy($id)
    {
        User::findOrFail($id)->delete();

        return redirect()->route('admin.students.index')
            ->with('success', 'Student deleted');
    }
}
