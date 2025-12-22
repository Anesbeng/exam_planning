<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // ✅ LIST USERS (FILTER + SEARCH + PAGINATION)
    public function index(Request $request)
    {
        $query = User::query();

        // Filter by role
        if ($request->role) {
            $query->where('role', $request->role);
        }

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('matricule', 'like', "%{$request->search}%");
            });
        }

        return response()->json(
            $query->orderBy('id', 'desc')->paginate(5)
        );
    }

    // ✅ UPDATE USER
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $user->update($request->only([
            'name',
            'email',
            'role',
            'specialite',
            'niveau',
            'groupe'
        ]));

        return response()->json(['message' => 'User updated']);
    }

    // ✅ DELETE USER
    public function destroy($id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'User deleted']);
    }
}
