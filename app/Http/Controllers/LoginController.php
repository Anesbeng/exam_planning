<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function show()
    {
        return view('login');
    }

    public function login()
    {
        $credentials = [
            'matricule' => request('matricule'),
            'password'  => request('password'),
        ];

        if (Auth::attempt($credentials)) {
            if (Auth::user()->role === 'admin') {
                return redirect('/admin/exams');
            }
            return redirect('/homeuser');
        }

        return back()->with('error', 'Incorrect credentials');
    }

    public function logout()
    {
        Auth::logout();
        return redirect('/login');
    }
}