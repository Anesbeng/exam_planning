<?php
// File: app/Http/Controllers/AcademicYearController.php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use Illuminate\Http\Request;

class AcademicYearController extends Controller
{
    public function index()
    {
        return response()->json([
            'academic_years' => AcademicYear::with('semesters')->orderBy('start_date', 'desc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:academic_years,name',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_current' => 'boolean'
        ]);

        // If setting as current, unset all others
        if ($validated['is_current'] ?? false) {
            AcademicYear::where('is_current', true)->update(['is_current' => false]);
        }

        $academicYear = AcademicYear::create($validated);

        return response()->json([
            'message' => 'Année universitaire créée avec succès',
            'academic_year' => $academicYear
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $academicYear = AcademicYear::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:academic_years,name,' . $id,
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_current' => 'boolean'
        ]);

        // If setting as current, unset all others
        if ($validated['is_current'] ?? false) {
            AcademicYear::where('id', '!=', $id)->where('is_current', true)->update(['is_current' => false]);
        }

        $academicYear->update($validated);

        return response()->json([
            'message' => 'Année universitaire mise à jour avec succès',
            'academic_year' => $academicYear
        ]);
    }

    public function destroy($id)
    {
        AcademicYear::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Année universitaire supprimée avec succès'
        ]);
    }
}
