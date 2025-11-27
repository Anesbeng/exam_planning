<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ImportController extends Controller
{
    public function showForm()
    {
        return view('import');
    }

    public function import(Request $request)
{
    $request->validate([
        'file' => 'required|mimes:csv,txt|max:2048'
    ]);

    try {
        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        
        // Skip header row
        $header = fgetcsv($handle, 1000, ';'); // CHANGEMENT ICI
        
        $imported = 0;
        while (($row = fgetcsv($handle, 1000, ';')) !== false) { // CHANGEMENT ICI
            if (count($row) >= 3) {
                User::create([
                    'matricule' => $row[0],
                    'name' => $row[1],
                    'email' => $row[2],
                    'role' => $row[3] ?? 'student',
                    'password' => $row[4],
                    'specialite' => $row[5],
                    'niveau' => $row[6],
                    'annee_scolaire' => $row[7],
                    'groupe' => $row[8],
                ]);
                $imported++;
            }
        }
        
        fclose($handle);
        
        return redirect('/users-list')->with('success', "$imported utilisateurs importés avec succès !");
    } catch (\Exception $e) {
        return redirect()->back()->with('error', 'Erreur : ' . $e->getMessage());
    }
}
}