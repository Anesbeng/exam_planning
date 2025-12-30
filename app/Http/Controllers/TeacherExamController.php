<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Exam;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TeacherExamController extends Controller
{
    public function getMyExams(Request $request)
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'teacher') {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        Log::info('=== FETCHING TEACHER EXAMS ===');
        Log::info('Teacher ID: ' . $user->id);
        Log::info('Teacher Matricule: ' . $user->matricule);
        Log::info('Teacher Name: ' . $user->name);
        Log::info('Teacher Email: ' . $user->email);

        /*
        |--------------------------------------------------------------------------
        | 1️⃣ Find modules where teacher is RESPONSIBLE (by matricule)
        |--------------------------------------------------------------------------
        */
        $modulesByMatricule = Module::where('teacher_responsible', $user->matricule)->get();
        Log::info('Modules found by MATRICULE (' . $user->matricule . '): ' . $modulesByMatricule->count());
        
        /*
        |--------------------------------------------------------------------------
        | 2️⃣ FALLBACK: Also check by name (in case data is inconsistent)
        |--------------------------------------------------------------------------
        */
        $modulesByName = Module::where('teacher_responsible', $user->name)->get();
        Log::info('Modules found by NAME (' . $user->name . '): ' . $modulesByName->count());
        
        // Merge both results (remove duplicates)
        $modules = $modulesByMatricule->merge($modulesByName)->unique('id');
        $moduleNames = $modules->pluck('name')->unique();

        Log::info('Total unique modules: ' . $modules->count());
        Log::info('Module Names: ' . $moduleNames->toJson());

        /*
        |--------------------------------------------------------------------------
        | 3️⃣ Get exams for those modules
        |--------------------------------------------------------------------------
        */
        $responsibleExams = collect();
        
        if ($moduleNames->count() > 0) {
            $responsibleExams = Exam::whereIn('module', $moduleNames)
                ->orderBy('date')
                ->orderBy('start_time')
                ->get();

            Log::info('Exams found for responsible modules: ' . $responsibleExams->count());
        } else {
            Log::warning('No modules found where teacher is responsible!');
            
            // Debug: Check what's in modules table
            $allModules = Module::select('id', 'name', 'teacher_responsible')->get();
            Log::info('ALL MODULES IN DATABASE: ' . $allModules->toJson());
        }

        /*
        |--------------------------------------------------------------------------
        | 4️⃣ Get exams where teacher is SURVEILLANT
        |--------------------------------------------------------------------------
        */
        $surveillanceQuery = Exam::where(function ($q) use ($user) {
                $q->where('teacher', $user->name)
                  ->orWhere('teacher', $user->matricule);
            })
            ->orderBy('date')
            ->orderBy('start_time');

        $examsCount = (clone $surveillanceQuery)->where('type', 'examen')->count();
        $ccCount = (clone $surveillanceQuery)->where('type', 'cc')->count();
        $rattrapageCount = (clone $surveillanceQuery)->where('type', 'rattrapage')->count();

        Log::info('Surveillance Exams - Examen: ' . $examsCount);
        Log::info('Surveillance Exams - CC: ' . $ccCount);
        Log::info('Surveillance Exams - Rattrapage: ' . $rattrapageCount);

        /*
        |--------------------------------------------------------------------------
        | 5️⃣ Return response with detailed debug info
        |--------------------------------------------------------------------------
        */
        return response()->json([
            'teacher' => [
                'name' => $user->name,
                'matricule' => $user->matricule,
                'email' => $user->email,
                'photo' => $user->photo ?? null,
                'specialite' => $user->specialite ?? null,
            ],

            // Exams where teacher is surveillant
            'exams' => (clone $surveillanceQuery)->where('type', 'examen')->get(),
            'cc' => (clone $surveillanceQuery)->where('type', 'cc')->get(),
            'rattrapage' => (clone $surveillanceQuery)->where('type', 'rattrapage')->get(),

            // Exams where teacher is responsible for the module
            'responsable_modules' => $responsibleExams,
            
            // Detailed debug info
            'debug' => [
                'teacher_id' => $user->id,
                'teacher_matricule' => $user->matricule,
                'teacher_name' => $user->name,
                'teacher_email' => $user->email,
                'modules_by_matricule' => $modulesByMatricule->pluck('name'),
                'modules_by_name' => $modulesByName->pluck('name'),
                'total_modules_found' => $modules->count(),
                'module_names' => $moduleNames->toArray(),
                'responsable_exams_count' => $responsibleExams->count(),
                'surveillance_counts' => [
                    'examen' => $examsCount,
                    'cc' => $ccCount,
                    'rattrapage' => $rattrapageCount,
                ],
                'all_modules_in_db' => Module::select('id', 'name', 'teacher_responsible')->get(),
            ]
        ]);
    }
}