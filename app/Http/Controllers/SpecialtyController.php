<?php

namespace App\Http\Controllers;

use App\Models\Specialty;
use Illuminate\Http\Request;

class SpecialtyController extends Controller
{
    public function index()
    {
        return response()->json([
            'specialties' => Specialty::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:specialties,code',
            'name' => 'required|string|max:255'
        ]);

        $specialty = Specialty::create($validated);

        return response()->json([
            'message' => 'Spécialité créée avec succès',
            'specialty' => $specialty
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $specialty = Specialty::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:specialties,code,' . $id,
            'name' => 'required|string|max:255'
        ]);

        $specialty->update($validated);

        return response()->json([
            'message' => 'Spécialité mise à jour avec succès',
            'specialty' => $specialty
        ]);
    }

    public function destroy($id)
    {
        Specialty::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Spécialité supprimée avec succès'
        ]);
    }
}
