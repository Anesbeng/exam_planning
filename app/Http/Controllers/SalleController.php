<?php

namespace App\Http\Controllers;

use App\Models\salle;
use Illuminate\Http\Request;

class SalleController extends Controller
{
    public function index()
    {
        $salle = salle::all();
        return view('admin.salle.index', compact('salle'));
    }

    public function create()
    {
        return view('admin.salle.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|string|max:255',
            'location' => 'required|string|max:255',
        ]);

        salle::create([
            'name' => $request->name,
            'capacity' => $request->capacity,
            'location' => $request->location,
        ]);

        return redirect()->route('admin.salle.index')
                         ->with('success', 'Module créé avec succès');
    }

    public function show(salle $salle)
    {
        return view('admin.salle.show', compact('salle'));
    }

    public function edit(salle $salle)
    {
        return view('admin.salle.edit', compact('salle'));
    }

    public function update(Request $request, salle $salle)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|string|max:255',
            'location' => 'required|string|max:255',
        ]);

        $salle->update([
            'name' => $request->name,
            'capacity' => $request->capacity,
            'location' => $request->location,
        ]);

        return redirect()->route('admin.salle.index')
                         ->with('success', 'Module mis à jour');
    }

    public function destroy(salle $salle)
    {
        $salle->delete();

        return redirect()->route('admin.salle.index')
                         ->with('success', 'Module supprimé');
    }
}
