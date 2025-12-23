<?php

namespace App\Http\Controllers;

use App\Models\Salle;
use Illuminate\Http\Request;

class SalleController extends Controller
{
    /**
     * Display a listing of rooms
     */
    public function index()
    {
        $salles = Salle::all();
        return response()->json([
            'salles' => $salles
        ]);
    }

    /**
     * Show the form for creating a new room
     */
    public function create()
    {
        return response()->json([
            'message' => 'Ready to create'
        ]);
    }

    /**
     * Store a newly created room
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'location' => 'required|string|max:255',
            'type' => 'nullable|string|max:255',
            'equipment' => 'nullable|string|max:500',
        ]);

        $salle = Salle::create([
            'name' => $request->name,
            'capacity' => $request->capacity,
            'location' => $request->location,
            'type' => $request->type,
            'equipment' => $request->equipment,
        ]);

        return response()->json([
            'message' => 'Salle créée avec succès',
            'salle' => $salle
        ], 201);
    }

    /**
     * Display the specified room
     */
    public function show($id)
    {
        $salle = Salle::findOrFail($id);
        return response()->json([
            'salle' => $salle
        ]);
    }

    /**
     * Show the form for editing the specified room
     */
    public function edit($id)
    {
        $salle = Salle::findOrFail($id);
        return response()->json([
            'salle' => $salle
        ]);
    }

    /**
     * Update the specified room
     */
    public function update(Request $request, $id)
    {
        $salle = Salle::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'location' => 'required|string|max:255',
            'type' => 'nullable|string|max:255',
            'equipment' => 'nullable|string|max:500',
        ]);

        $salle->update([
            'name' => $request->name,
            'capacity' => $request->capacity,
            'location' => $request->location,
            'type' => $request->type,
            'equipment' => $request->equipment,
        ]);

        return response()->json([
            'message' => 'Salle mise à jour avec succès',
            'salle' => $salle
        ]);
    }

    /**
     * Remove the specified room
     */
    public function destroy($id)
    {
        $salle = Salle::findOrFail($id);
        $salle->delete();

        return response()->json([
            'message' => 'Salle supprimée avec succès'
        ]);
    }
}