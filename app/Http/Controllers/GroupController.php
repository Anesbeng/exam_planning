<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    public function index()
    {
        return response()->json([
            'groups' => Group::with(['level', 'specialty'])->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'level_id' => 'required|exists:levels,id',
            'specialty_id' => 'required|exists:specialties,id'
        ]);

        $group = Group::create($validated);

        return response()->json([
            'message' => 'Groupe créé avec succès',
            'group' => $group->load(['level', 'specialty'])
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $group = Group::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'level_id' => 'required|exists:levels,id',
            'specialty_id' => 'required|exists:specialties,id'
        ]);

        $group->update($validated);

        return response()->json([
            'message' => 'Groupe mis à jour avec succès',
            'group' => $group->load(['level', 'specialty'])
        ]);
    }

    public function destroy($id)
    {
        Group::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Groupe supprimé avec succès'
        ]);
    }
}