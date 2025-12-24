<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class TeacherController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'teacher');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('matricule', 'like', "%{$request->search}%");
        }

        return response()->json(['teachers' => $query->get()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'matricule' => 'required|unique:users',
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'specialite' => 'required',
            
        ]);

        User::create([
            'matricule' => $request->matricule,
            'name' => $request->name,
            'email' => $request->email,
            'role' => 'teacher',
            'password' => $request->password,
            'specialite' => $request->specialite,
            'niveau' => 'null',
            'groupe' => 'null',
            'annee_scolaire' => $request->annee_scolaire,
        ]);
    }

    public function update(Request $request, $id)
    {
        $teacher = User::findOrFail($id);

        $data = $request->except('password');
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $teacher->update($data);
    }

    public function destroy($id)
    {
        User::findOrFail($id)->delete();
    }

    /* ========= CSV IMPORT ========= */
    public function import(Request $request)
    {
        $file = fopen($request->file('file'), 'r');
        fgetcsv($file, 1000, ';'); // header

        while (($row = fgetcsv($file, 1000, ';')) !== false) {
            User::create([
                'matricule' => $row[0],
                'name' => $row[1],
                'email' => $row[2],
                'password' => $row[3],
                'specialite' => $row[4],
                'niveau' => $row[5],
                'annee_scolaire' => $row[6],
                'groupe' => $row[7],
                'role' => 'teacher',
            ]);
        }
        fclose($file);

        return response()->json(['message' => 'Import réussi']);
    }
}
