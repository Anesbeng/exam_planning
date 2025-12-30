<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\User;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    /**
     * Display a listing of modules
     */
    public function index()
    {
        // Get all modules with teacher information
        $modules = Module::all()->map(function ($module) {
            // Find teacher by matricule to get their name for display
            $teacher = User::where('matricule', $module->teacher_responsible)
                          ->where('role', 'teacher')
                          ->first();
            
            return [
                'id' => $module->id,
                'code' => $module->code,
                'name' => $module->name,
                'semester' => $module->semester,
                'teacher_responsible' => $module->teacher_responsible,
                'teacher_name' => $teacher ? $teacher->name : $module->teacher_responsible,
            ];
        });

        return response()->json([
            'modules' => $modules
        ]);
    }

    /**
     * Show the form for creating a new module
     */
    public function create()
    {
        return response()->json([
            'teachers' => User::where('role', 'teacher')
                             ->select('id', 'name', 'matricule', 'email')
                             ->get()
        ]);
    }

    /**
     * Store a newly created module
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:modules,code',
            'semester' => 'required|string|max:50',
            'teacher_responsible' => 'required|string|max:255', // This will be matricule
        ]);

        // Verify teacher exists
        $teacher = User::where('matricule', $validated['teacher_responsible'])
                      ->where('role', 'teacher')
                      ->first();

        if (!$teacher) {
            return response()->json([
                'message' => 'Enseignant non trouvé'
            ], 404);
        }

        $module = Module::create($validated);

        return response()->json([
            'message' => 'Module créé avec succès',
            'module' => $module
        ], 201);
    }

    /**
     * Update the specified module
     */
    public function update(Request $request, $id)
    {
        $module = Module::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:modules,code,' . $id,
            'semester' => 'required|string|max:50',
            'teacher_responsible' => 'required|string|max:255', // This will be matricule
        ]);

        // Verify teacher exists
        $teacher = User::where('matricule', $validated['teacher_responsible'])
                      ->where('role', 'teacher')
                      ->first();

        if (!$teacher) {
            return response()->json([
                'message' => 'Enseignant non trouvé'
            ], 404);
        }

        $module->update($validated);

        return response()->json([
            'message' => 'Module mis à jour avec succès',
            'module' => $module
        ]);
    }

    /**
     * Remove the specified module
     */
    public function destroy($id)
    {
        Module::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Module supprimé avec succès'
        ]);
    }
}