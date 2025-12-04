<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\User;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function index()
    {
        $modules = Module::all();
        return view('admin.modules.index', compact('modules'));
    }

    public function create()
    {
    $teachers = User::where('role', 'teacher')->get();
    return view('admin.modules.create', compact('teachers'));
    }


    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'semester' => 'required|string|max:50',
            'teacher_responsible' => 'required|string|max:255',
        ]);

        Module::create([
            'name' => $request->name,
            'code' => $request->code,
            'semester' => $request->semester,
            'teacher_responsible' => $request->teacher_responsible,
        ]);

        return redirect()->route('admin.modules.index')
                         ->with('success', 'Module créé avec succès');
    }

    public function show(Module $module)
    {
        return view('admin.modules.show', compact('module'));
    }

   public function edit(Module $module)
{
    $teachers = User::where('role', 'teacher')->get();
    return view('admin.modules.edit', compact('module', 'teachers'));
}

    public function update(Request $request, Module $module)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'semester' => 'required|string|max:50',
            'teacher_responsible' => 'required|string|max:255',
        ]);

        $module->update([
            'name' => $request->name,
            'code' => $request->code,
            'semester' => $request->semester,
            'teacher_responsible' => $request->teacher_responsible,
        ]);

        return redirect()->route('admin.modules.index')
                         ->with('success', 'Module mis à jour');
    }

    public function destroy(Module $module)
    {
        $module->delete();

        return redirect()->route('admin.modules.index')
                         ->with('success', 'Module supprimé');
    }
     
    
}
