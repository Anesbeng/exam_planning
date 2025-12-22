<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ImportmodulesController extends Controller
{
    /
     * Import modules from file (CSV or Excel)
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt,xlsx,xls|max:2048'
        ]);

        try {
            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();
            
            // Handle Excel files
            if (in_array($extension, ['xlsx', 'xls'])) {
                return $this->importExcel($file);
            }
            
            // Handle CSV files
            return $this->importCsv($file);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'import',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /
     * Import from Excel file
     */
    private function importExcel($file)
    {
        $imported = 0;
        $errors = [];
        
        $data = Excel::toArray([], $file)[0]; // First sheet
        
        // Skip header row
        array_shift($data);
        
        foreach ($data as $index => $row) {
            $line = $index + 2; // +2 because we skipped header and Excel starts at 1
            
            // Check if row is not empty
            if (empty(array_filter($row))) {
                continue;
            }
            
            // Check if we have at least 4 columns
            if (count($row) < 4) {
                $errors[] = "Ligne $line : données incomplètes";
                continue;
            }
            
            try {
                // Check for duplicate code
                $existingModule = Module::where('code', trim($row[1]))->first();
                if ($existingModule) {
                    $errors[] = "Ligne $line : le code " . trim($row[1]) . " existe déjà";
                    continue;
                }

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
        
        return response()->json([
            'message' => "$imported module(s) importé(s) avec succès",
            'imported' => $imported,
            'errors' => $errors
        ]);
    }
    
    /**
     * Import from CSV file
     */
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
            
            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }
            
            // Check if we have at least 4 columns
            if (count($row) < 4) {
                $errors[] = "Ligne $line : données incomplètes";
                continue;
            }
            
            try {
                // Check for duplicate code
                $existingModule = Module::where('code', trim($row[1]))->first();
                if ($existingModule) {
                    $errors[] = "Ligne $line : le code " . trim($row[1]) . " existe déjà";
                    continue;
                }Module::create([
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
        
        return response()->json([
            'message' => "$imported module(s) importé(s) avec succès",
            'imported' => $imported,
            'errors' => $errors
        ]);
    }
}