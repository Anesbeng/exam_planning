<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Claim;
use App\Models\Exam;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ClaimController extends Controller
{
    public function index(Request $request)
    {
        $claims = Claim::with(['exam', 'teacher'])
            ->orderBy('status')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['claims' => $claims]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'exam_type' => 'required|string',
            'message' => 'required|string|max:2000',
            'teacher_matricule' => 'required|string'
        ]);

        $teacher = User::where('matricule', $request->teacher_matricule)
            ->where('role', 'teacher')
            ->first();

        if (!$teacher) {
            return response()->json([
                'message' => 'Teacher not found with the provided matricule'
            ], 404);
        }

        $claim = Claim::create([
            'exam_id' => $request->exam_id,
            'teacher_id' => $teacher->id,
            'teacher_name' => $teacher->name,
            'message' => $request->message,
            'exam_type' => $request->exam_type,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Claim created successfully',
            'claim' => $claim->load(['exam', 'teacher'])
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => ['required', Rule::in(['pending', 'approved', 'rejected'])]
        ]);

        $claim = Claim::findOrFail($id);
        $claim->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Claim updated successfully',
            'claim' => $claim
        ]);
    }

    public function destroy($id)
    {
        $claim = Claim::findOrFail($id);
        $claim->delete();
        
        return response()->json(['message' => 'Claim deleted successfully']);
    }
}