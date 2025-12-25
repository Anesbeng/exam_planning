<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        // Validate input
        $request->validate([
            'matricule' => 'required',
            'password' => 'required',
        ]);

        // Try to find user by matricule
        $user = User::where('matricule', $request->matricule)->first();

        // Check if user exists
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Matricule not found'
            ], 401);
        }

        // Check password
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Incorrect password'
            ], 401);
        }

        // Log the user in
        Auth::login($user);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'matricule' => $user->matricule,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'specialite' => $user->specialite,
                'niveau' => $user->niveau,
                'annee_scolaire' => $user->annee_scolaire,
                'groupe' => $user->groupe,
            ]
        ], 200);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }
}