<?php

namespace App\Imports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Hash;

class UsersImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Skip empty rows
        if (empty($row['matricule']) || empty($row['name']) || empty($row['email'])) {
            return null;
        }

        return new User([
            'matricule' => $row['matricule'],
            'name'      => $row['name'],
            'email'     => $row['email'],
            'role'      => $row['role'] ?? 'student',
            'password'  => $row['password'] ,
            'specialite'  => $row['specialite'] ,
            'niveau'  => $row['niveau'] ,
            'annee_scolaire'  => $row['annee_scolaire'] ,
            'groupe'  => $row['groupe'] ,
        ]);
    }
}