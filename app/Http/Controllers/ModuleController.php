<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\User;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    /
     * Display a listing of modules
     */
    public function index()
    {
        $modules = Module::all();
        return response()->json([
            'modules' => $modules
        ]);
    }

    /
     * Show the form for creating a new module (returns teachers list)
     */
    public function create()
    {
        $teachers = User::where('role', 'teacher')->get();
        return response()->json([
            'teachers' => $teachers
        ]);
    }

    /
     * Store a newly created module
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:modules,code',
            'semester' => 'required|string|max:50',
            'teacher_responsible' => 'required|string|max:255',
        ]);

        $module = Module::create([
            'name' => $request->name,
            'code' => $request->code,
            'semester' => $request->semester,
            'teacher_responsible' => $request->teacher_responsible,
        ]);

        return response()->json([
            'message' => 'Module créé avec succès',
            'module' => $module
        ], 201);
    }

    /
     * Display the specified module
     */
    public function show($id)
    {
        $module = Module::findOrFail($id);
        return response()->json([
            'module' => $module
        ]);
    }

    /
     * Show the form for editing the specified module
     */
    public function edit($id)
    {
        $module = Module::findOrFail($id);
        $teachers = User::where('role', 'teacher')->get();
        
        return response()->json([
            'module' => $module,
            'teachers' => $teachers
        ]);
    }

    /
     * Update the specified module
     */
    public function update(Request $request, $id)
    {
        $module = Module::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:modules,code,' . $id,
            'semester' => 'required|string|max:50',
            'teacher_responsible' => 'required|string|max:255',
        ]);

        $module->update([
            'name' => $request->name,
            'code' => $request->code,
            'semester' => $request->semester,
            'teacher_responsible' => $request->teacher_responsible,
        ]);

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
        $module = Module::findOrFail($id);
        $module->delete();

        return response()->json([
            'message' => 'Module supprimé avec succès'
        ]);
    }
}