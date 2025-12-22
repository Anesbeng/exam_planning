<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ImportController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,txt|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $handle = fopen($file->getRealPath(), 'r');
            
            if ($handle === false) {
                return response()->json([
                    'message' => 'Unable to open file'
                ], 500);
            }
            
            // Skip header row
            $header = fgetcsv($handle, 1000, ';');
            
            $imported = 0;
            $errors = [];
            $lineNumber = 1;
            
            while (($row = fgetcsv($handle, 1000, ';')) !== false) {
                $lineNumber++;
                
                // Skip empty rows
                if (empty(array_filter($row))) {
                    continue;
                }
                
                // Validate row has minimum required fields
                if (count($row) < 9) {
                    $errors[] = "Line $lineNumber: Insufficient columns (expected 9, got " . count($row) . ")";
                    continue;
                }
                
                try {
                    // Check if student already exists
                    $existingStudent = User::where('matricule', $row[0])
                        ->orWhere('email', $row[2])
                        ->first();
                    
                    if ($existingStudent) {
                        $errors[] = "Line $lineNumber: Student with matricule {$row[0]} or email {$row[2]} already exists";
                        continue;
                    }
                    
                    User::create([
                        'matricule' => trim($row[0]),
                        'name' => trim($row[1]),
                        'email' => trim($row[2]),
                        'role' => !empty(trim($row[3])) ? trim($row[3]) : 'student',
                        'password' => Hash::make(trim($row[4])),
                        'specialite' => trim($row[5]),
                        'niveau' => trim($row[6]),
                        'annee_scolaire' => trim($row[7]),
                        'groupe' => trim($row[8]),
                    ]);
                    
                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Line $lineNumber: " . $e->getMessage();
                }
            }
            
            fclose($handle);
            
            $response = [
                'message' => "$imported étudiant(s) importé(s) avec succès",
                'imported' => $imported,
            ];
            
            if (!empty($errors)) {
                $response['errors'] = $errors;
                $response['message'] .= " avec " . count($errors) . " erreur(s)";
            }
            
            return response()->json($response, 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'importation: ' . $e->getMessage()
            ], 500);
        }
    }
}