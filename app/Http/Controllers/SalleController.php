<?php

namespace App\Http\Controllers;

use App\Models\Salle;
use App\Models\Exam;
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
     * Return available rooms for a given date/time
     * Query params: date (YYYY-MM-DD), start_time (HH:MM), end_time (HH:MM), exclude_exam_id (optional)
     */
    public function available(Request $request)
    {
        $date = $request->query('date');
        $start = $request->query('start_time');
        $end = $request->query('end_time');
        $excludeExamId = $request->query('exclude_exam_id');

        if (!$date || !$start || !$end) {
            // if no date/time specified, just return all rooms
            $salles = Salle::all();
            return response()->json([
                'salles' => $salles
            ]);
        }

        $takenRooms = Exam::where('date', $date)
            ->when($excludeExamId, function($q) use ($excludeExamId) {
                $q->where('id', '!=', $excludeExamId);
            })
            ->where('start_time', '<', $end)
            ->where('end_time', '>', $start)
            ->pluck('room')
            ->toArray();

        $salles = Salle::whereNotIn('name', $takenRooms)->get();

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