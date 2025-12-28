<?php

namespace App\Http\Controllers;

use App\Models\Semester;
use Illuminate\Http\Request;

class SemesterController extends Controller
{
    public function index()
    {
        return response()->json([
            'semesters' => Semester::with('academicYear')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'academic_year_id' => 'required|exists:academic_years,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date'
        ]);

        $semester = Semester::create($validated);

        return response()->json([
            'message' => 'Semestre créé avec succès',
            'semester' => $semester->load('academicYear')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $semester = Semester::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'academic_year_id' => 'required|exists:academic_years,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date'
        ]);

        $semester->update($validated);

        return response()->json([
            'message' => 'Semestre mis à jour avec succès',
            'semester' => $semester->load('academicYear')
        ]);
    }

    public function destroy($id)
    {
        Semester::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Semestre supprimé avec succès'
        ]);
    }
}
