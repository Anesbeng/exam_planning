<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImportmodulesController extends Controller
{
    public function showForm()
    {
        return view('admin.modules.import');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt,xlsx,xls|max:2048'
        ]);

        try {
            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();
            
            // Si c'est un fichier Excel
            if (in_array($extension, ['xlsx', 'xls'])) {
                return $this->importExcel($file);
            }
            
            // Si c'est un CSV
            return $this->importCsv($file);
            
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Erreur lors de l\'import : ' . $e->getMessage());
        }
    }
    
    private function importExcel($file)
    {
        $imported = 0;
        $errors = [];
        
        $data = Excel::toArray([], $file)[0]; // Première feuille
        
        // Skip header (première ligne)
        array_shift($data);
        
        foreach ($data as $index => $row) {
            $line = $index + 2; // +2 car on a skip le header et Excel commence à 1
            
            // Vérifier que la ligne n'est pas vide
            if (empty(array_filter($row))) {
                continue;
            }
            
            // Vérifier qu'on a au moins 4 colonnes
            if (count($row) < 4) {
                $errors[] = "Ligne $line : données incomplètes";
                continue;
            }
            
            try {
                Module::create([
                    'name' => trim($row[0]),
                    'code' => trim($row[1]),
                    'semester' => trim($row[2]),
                    'teacher_responsible' => trim($row[3]),
                ]);
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Ligne $line : " . $e->getMessage();
            }
        }
        
        $message = "$imported module(s) importé(s) avec succès !";
        if (!empty($errors)) {
            $message .= " (" . count($errors) . " erreur(s))";
        }
        
        return redirect()->route('admin.modules.index')
            ->with('success', $message)
            ->with('import_errors', $errors);
    }
    
    private function importCsv($file)
    {
        $handle = fopen($file->getRealPath(), 'r');
        
        if (!$handle) {
            throw new \Exception("Impossible d'ouvrir le fichier");
        }

        // Skip header row
        $header = fgetcsv($handle, 1000, ';');
        
        $imported = 0;
        $errors = [];
        $line = 1;
        
        while (($row = fgetcsv($handle, 1000, ';')) !== false) {
            $line++;
            
            if (empty(array_filter($row))) {
                continue;
            }
            
            if (count($row) < 4) {
                $errors[] = "Ligne $line : données incomplètes";
                continue;
            }
            
            try {
                Module::create([
                    'name' => trim($row[0]),
                    'code' => trim($row[1]),
                    'semester' => trim($row[2]),
                    'teacher_responsible' => trim($row[3]),
                ]);
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Ligne $line : " . $e->getMessage();
            }
        }
        
        fclose($handle);
        
        $message = "$imported module(s) importé(s) avec succès !";
        if (!empty($errors)) {
            $message .= " (" . count($errors) . " erreur(s))";
        }
        
        return redirect()->route('admin.modules.index')
            ->with('success', $message)
            ->with('import_errors', $errors);
    }
}