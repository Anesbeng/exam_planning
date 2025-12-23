<?php

namespace App\Http\Controllers;

use App\Models\Salle;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ImportSallesController extends Controller
{
    /**
     * Import rooms from file (CSV or Excel)
     */
    public function import(Request $request)
    {
        // Validate the uploaded file
        $request->validate([
            'file' => 'required|mimes:csv,txt,xlsx,xls|max:2048'
        ]);

        try {
            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();
            
            // Handle Excel files (.xlsx, .xls)
            if (in_array($extension, ['xlsx', 'xls'])) {
                return $this->importExcel($file);
            }
            
            // Handle CSV files (.csv, .txt)
            return $this->importCsv($file);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'import',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Import from Excel file
     * Expected columns: Nom | Capacité | Localisation | Type (optional) | Équipement (optional)
     */
    private function importExcel($file)
    {
        $imported = 0;
        $errors = [];
        
        // Load Excel file and get first sheet
        $data = Excel::toArray([], $file)[0];
        
        // Skip header row (first row)
        array_shift($data);
        
        foreach ($data as $index => $row) {
            $line = $index + 2; // +2 because we skipped header and Excel starts at line 1
            
            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }
            
            // Validate minimum required columns (name, capacity, location)
            if (count($row) < 3) {
                $errors[] = "Ligne $line : données incomplètes - minimum 3 colonnes requises (Nom, Capacité, Localisation)";
                continue;
            }
            
            // Validate room name is not empty
            if (empty(trim($row[0]))) {
                $errors[] = "Ligne $line : le nom de la salle est obligatoire";
                continue;
            }
            
            // Check for duplicate room name
            $roomName = trim($row[0]);
            $existingSalle = Salle::where('name', $roomName)->first();
            if ($existingSalle) {
                $errors[] = "Ligne $line : la salle '$roomName' existe déjà";
                continue;
            }

            // Validate capacity is numeric and positive
            if (!is_numeric($row[1]) || intval($row[1]) <= 0) {
                $errors[] = "Ligne $line : la capacité doit être un nombre positif";
                continue;
            }

            // Validate location is not empty
            if (empty(trim($row[2]))) {
                $errors[] = "Ligne $line : la localisation est obligatoire";
                continue;
            }

            try {
                // Create new room
                Salle::create([
                    'name' => $roomName,
                    'capacity' => intval($row[1]),
                    'location' => trim($row[2]),
                    'type' => isset($row[3]) && !empty(trim($row[3])) ? trim($row[3]) : null,
                    'equipment' => isset($row[4]) && !empty(trim($row[4])) ? trim($row[4]) : null,
                ]);
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Ligne $line : erreur lors de la création - " . $e->getMessage();
            }
        }
        
        // Return success response with details
        $message = "$imported salle(s) importée(s) avec succès";
        if (!empty($errors)) {
            $message .= " avec " . count($errors) . " erreur(s)";
        }
        
        return response()->json([
            'message' => $message,
            'imported' => $imported,
            'total_errors' => count($errors),
            'errors' => $errors
        ]);
    }
    
    /**
     * Import from CSV file
     * Expected format: CSV with semicolon (;) separator
     * Expected columns: Nom;Capacité;Localisation;Type;Équipement
     */
    private function importCsv($file)
    {
        $handle = fopen($file->getRealPath(), 'r');
        
        if (!$handle) {
            throw new \Exception("Impossible d'ouvrir le fichier CSV");
        }

        // Read and skip header row
        $header = fgetcsv($handle, 1000, ';');
        
        $imported = 0;
        $errors = [];
        $line = 1; // Start at line 1 (header)
        
        while (($row = fgetcsv($handle, 1000, ';')) !== false) {
            $line++;
            
            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }
            
            // Validate minimum required columns
            if (count($row) < 3) {
                $errors[] = "Ligne $line : données incomplètes - minimum 3 colonnes requises (Nom, Capacité, Localisation)";
                continue;
            }
            
            // Validate room name is not empty
            if (empty(trim($row[0]))) {
                $errors[] = "Ligne $line : le nom de la salle est obligatoire";
                continue;
            }
            
            // Check for duplicate room name
            $roomName = trim($row[0]);
            $existingSalle = Salle::where('name', $roomName)->first();
            if ($existingSalle) {
                $errors[] = "Ligne $line : la salle '$roomName' existe déjà";
                continue;
            }

            // Validate capacity is numeric and positive
            if (!is_numeric($row[1]) || intval($row[1]) <= 0) {
                $errors[] = "Ligne $line : la capacité doit être un nombre positif";
                continue;
            }

            // Validate location is not empty
            if (empty(trim($row[2]))) {
                $errors[] = "Ligne $line : la localisation est obligatoire";
                continue;
            }

            try {
                // Create new room
                Salle::create([
                    'name' => $roomName,
                    'capacity' => intval($row[1]),
                    'location' => trim($row[2]),
                    'type' => isset($row[3]) && !empty(trim($row[3])) ? trim($row[3]) : null,
                    'equipment' => isset($row[4]) && !empty(trim($row[4])) ? trim($row[4]) : null,
                ]);
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Ligne $line : erreur lors de la création - " . $e->getMessage();
            }
        }
        
        fclose($handle);
        
        // Return success response with details
        $message = "$imported salle(s) importée(s) avec succès";
        if (!empty($errors)) {
            $message .= " avec " . count($errors) . " erreur(s)";
        }
        
        return response()->json([
            'message' => $message,
            'imported' => $imported,
            'total_errors' => count($errors),
            'errors' => $errors
        ]);
    }
}