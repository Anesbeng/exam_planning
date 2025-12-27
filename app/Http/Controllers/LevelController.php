<?php

namespace App\Http\Controllers;

use App\Models\Level;
use Illuminate\Http\Request;

class LevelController extends Controller
{
    public function index()
    {
        return response()->json([
            'levels' => Level::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:levels,code',
            'name' => 'required|string|max:255'
        ]);

        $level = Level::create($validated);

        return response()->json([
            'message' => 'Niveau créé avec succès',
            'level' => $level
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $level = Level::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:levels,code,' . $id,
            'name' => 'required|string|max:255'
        ]);

        $level->update($validated);

        return response()->json([
            'message' => 'Niveau mis à jour avec succès',
            'level' => $level
        ]);
    }

    public function destroy($id)
    {
        Level::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Niveau supprimé avec succès'
        ]);
    }
}
