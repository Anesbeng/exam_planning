<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ImportController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,txt|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation du fichier échouée',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $handle = fopen($file->getRealPath(), 'r');
            
            if ($handle === false) {
                return response()->json([
                    'message' => 'Impossible d\'ouvrir le fichier'
                ], 500);
            }
            
            // Skip header row
            $header = fgetcsv($handle, 1000, ';');
            
            if ($header === false) {
                fclose($handle);
                return response()->json([
                    'message' => 'Le fichier CSV est vide ou mal formaté'
                ], 400);
            }
            
            // Validate header format
            $expectedHeaders = ['matricule', 'nom', 'email', 'role', 'password', 'specialite', 'niveau', 'annee_scolaire', 'groupe'];
            if (count($header) !== 9) {
                fclose($handle);
                return response()->json([
                    'message' => 'Format de l\'en-tête incorrect. Attendu: ' . implode(';', $expectedHeaders)
                ], 400);
            }
            
            $imported = 0;
            $errors = [];
            $lineNumber = 1;
            
            while (($row = fgetcsv($handle, 1000, ';')) !== false) {
                $lineNumber++;
                
                // Skip empty rows
                if (empty(array_filter($row))) {
                    continue;
                }
                
                // Validate row has required number of columns
                if (count($row) < 9) {
                    $errors[] = "Ligne $lineNumber: Colonnes insuffisantes (attendu 9, reçu " . count($row) . ")";
                    continue;
                }
                
                // Trim all values
                $row = array_map('trim', $row);
                
                // Extract values
                $matricule = $row[0];
                $name = $row[1];
                $email = $row[2];
                $role = !empty($row[3]) ? $row[3] : 'student';
                $password = $row[4];
                $specialite = $row[5];
                $niveau = $row[6];
                $annee_scolaire = $row[7];
                $groupe = $row[8];
                
                // Validate required fields
                if (empty($name)) {
                    $errors[] = "Ligne $lineNumber: Le nom est requis";
                    continue;
                }
                
                if (empty($email)) {
                    $errors[] = "Ligne $lineNumber: L'email est requis";
                    continue;
                }
                
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $errors[] = "Ligne $lineNumber: L'email '$email' n'est pas valide";
                    continue;
                }
                
                if (empty($password)) {
                    $errors[] = "Ligne $lineNumber: Le mot de passe est requis";
                    continue;
                }
                
                // Validate role
                $validRoles = ['admin', 'teacher', 'student'];
                if (!in_array($role, $validRoles)) {
                    $errors[] = "Ligne $lineNumber: Rôle invalide '$role' (valeurs autorisées: " . implode(', ', $validRoles) . ")";
                    continue;
                }
                
                try {
                    // Check if user already exists
                    $existingUser = User::where('email', $email)->first();
                    
                    if ($existingUser) {
                        $errors[] = "Ligne $lineNumber: Un utilisateur avec l'email '$email' existe déjà";
                        continue;
                    }
                    
                    // Check matricule if provided
                    if (!empty($matricule)) {
                        $existingMatricule = User::where('matricule', $matricule)->first();
                        if ($existingMatricule) {
                            $errors[] = "Ligne $lineNumber: Un utilisateur avec le matricule '$matricule' existe déjà";
                            continue;
                        }
                    }
                    
                    // Create user
                    User::create([
                        'matricule' => !empty($matricule) ? $matricule : null,
                        'name' => $name,
                        'email' => $email,
                        'role' => $role,
                        'password' => Hash::make($password),
                        'specialite' => !empty($specialite) ? $specialite : null,
                        'niveau' => !empty($niveau) ? $niveau : null,
                        'annee_scolaire' => !empty($annee_scolaire) ? $annee_scolaire : null,
                        'groupe' => !empty($groupe) ? $groupe : null,
                    ]);
                    
                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Ligne $lineNumber: " . $e->getMessage();
                    Log::error("Import error on line $lineNumber: " . $e->getMessage());
                }
            }
            
            fclose($handle);
            
            // Prepare response
            $response = [
                'message' => "$imported utilisateur(s) importé(s) avec succès",
                'imported' => $imported,
            ];
            
            if (!empty($errors)) {
                $response['errors'] = $errors;
                $response['error_count'] = count($errors);
                if ($imported > 0) {
                    $response['message'] .= " avec " . count($errors) . " erreur(s)";
                } else {
                    $response['message'] = "Aucun utilisateur importé. " . count($errors) . " erreur(s) détectée(s)";
                }
            }
            
            return response()->json($response, 200);
            
        } catch (\Exception $e) {
            Log::error("Import exception: " . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de l\'importation: ' . $e->getMessage()
            ], 500);
        }
    }
}