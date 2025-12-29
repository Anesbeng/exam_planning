<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        // Validate input
        $request->validate([
            'matricule' => 'required|string',
            'password' => 'required|string',
        ]);

        // Find user by matricule
        $user = User::where('matricule', $request->matricule)->first();

        // Check if user exists and password is correct
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Matricule ou mot de passe incorrect'
            ], 401);
        }

        // Create a Sanctum token for API access
        $token = $user->createToken('spa-token')->plainTextToken;

        // Return user data + token (exactly what your React app expects)
        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie',
            'user' => [
                'id' => $user->id,
                'matricule' => $user->matricule,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'specialite' => $user->specialite ?? null,
                'niveau' => $user->niveau ?? null,
                'annee_scolaire' => $user->annee_scolaire ?? null,
                'groupe' => $user->groupe ?? null,
            ],
            'token' => $token  // This is critical!
        ], 200);
    }

    /**
     * Logout - Revoke the current access token
     */
    public function logout(Request $request)
    {
        // Get the authenticated user (via token)
        $user = $request->user();

        if ($user) {
            // Revoke only the current token (not all tokens)
            $request->user()->currentAccessToken()->delete();

            // Optional: Revoke all tokens (full logout from all devices)
            // $user->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie'
        ]);
    }
}