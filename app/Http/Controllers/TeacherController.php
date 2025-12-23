<?php

namespace App\Http\Controllers;

use App\Models\User; // Using the same User model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

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

        return response()->json(['teachers' => $teachers]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'matricule' => 'required|unique:users,matricule',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'specialite' => 'nullable|string',
            'niveau' => 'nullable|string',
            'annee_scolaire' => 'nullable|string',
            'groupe' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $teacher = User::create([
            'matricule' => $request->matricule,
            'name' => $request->name,
            'email' => $request->email,
            'role' => 'teacher',
            'password' => Hash::make($request->password),
            'specialite' => $request->specialite,
            'niveau' => $request->niveau,
            'annee_scolaire' => $request->annee_scolaire,
            'groupe' => $request->groupe,
        ]);

        return response()->json(['teacher' => $teacher], 201);
    }

    public function show($id)
    {
        $teacher = User::where('role', 'teacher')->findOrFail($id);
        return response()->json(['teacher' => $teacher]);
    }

    public function update(Request $request, $id)
    {
        $teacher = User::where('role', 'teacher')->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'matricule' => 'required|unique:users,matricule,' . $id,
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'specialite' => 'nullable|string',
            'niveau' => 'nullable|string',
            'annee_scolaire' => 'nullable|string',
            'groupe' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $teacher->update([
            'matricule' => $request->matricule,
            'name' => $request->name,
            'email' => $request->email,
            'specialite' => $request->specialite,
            'niveau' => $request->niveau,
            'annee_scolaire' => $request->annee_scolaire,
            'groupe' => $request->groupe,
        ]);

        // Update password if provided
        if ($request->filled('password')) {
            $teacher->update(['password' => Hash::make($request->password)]);
        }

        return response()->json(['teacher' => $teacher]);
    }

    public function destroy($id)
    {
        $teacher = User::where('role', 'teacher')->findOrFail($id);
        $teacher->delete();

        return response()->json(['message' => 'Teacher deleted successfully']);
    }
}
