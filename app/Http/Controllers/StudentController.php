<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

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

        return response()->json([
            'students' => $students
        ]);
    }

    // 2️⃣ SHOW ADD FORM
    public function create()
    {
        return response()->json([
            'message' => 'Display form to create a student'
        ]);
    }

    // 3️⃣ SAVE NEW STUDENT
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'matricule' => 'required|unique:users,matricule',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'specialite' => 'required|string',
            'niveau' => 'required|string',
            'groupe' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $student = User::create([
            'matricule' => $request->matricule,
            'name' => $request->name,
            'email' => $request->email,
            'role' => 'student',
            'password' => Hash::make($request->password),
            'specialite' => $request->specialite,
            'niveau' => $request->niveau,
            'annee_scolaire' => $request->annee_scolaire,
            'groupe' => $request->groupe,
        ]);

        return response()->json([
            'message' => 'Student added successfully',
            'student' => $student
        ], 201);
    }

    // 4️⃣ SHOW STUDENT DETAILS
    public function show($id)
    {
        $student = User::where('role', 'student')->findOrFail($id);
        return response()->json([
            'student' => $student
        ]);
    }

    // 5️⃣ SHOW EDIT FORM
    public function edit($id)
    {
        $student = User::where('role', 'student')->findOrFail($id);
        return response()->json([
            'student' => $student
        ]);
    }

    // 6️⃣ UPDATE STUDENT
    public function update(Request $request, $id)
    {
        $student = User::where('role', 'student')->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'matricule' => 'required|unique:users,matricule,' . $id,
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'specialite' => 'required|string',
            'niveau' => 'required|string',
            'groupe' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = [
            'matricule' => $request->matricule,
            'name' => $request->name,
            'email' => $request->email,
            'specialite' => $request->specialite,
            'niveau' => $request->niveau,
            'annee_scolaire' => $request->annee_scolaire,
            'groupe' => $request->groupe,
        ];

        // Only update password if provided
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $student->update($updateData);

        return response()->json([
            'message' => 'Student updated successfully',
            'student' => $student
        ]);
    }

    // 7️⃣ DELETE STUDENT
    public function destroy($id)
    {
        $student = User::where('role', 'student')->findOrFail($id);
        $student->delete();

        return response()->json([
            'message' => 'Student deleted successfully'
        ]);
    }
}