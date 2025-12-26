<?php

namespace App\Http\Controllers;
use App\Models\User;

use App\Models\Claim;
use App\Models\Exam;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
            'teacher_matricule' => 'required'
        ]);

        $teacher = User::where('matricule', $request->teacher_matricule)
            ->where('role', 'teacher')
            ->firstOrFail();

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
            'claim' => $claim
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $claim = Claim::findOrFail($id);
        $claim->update(['status' => $request->status]);

        return response()->json(['message' => 'Claim updated']);
    }

    public function destroy($id)
    {
        Claim::findOrFail($id)->delete();
        return response()->json(['message' => 'Claim deleted']);
    }
}
