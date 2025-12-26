<?php

namespace App\Http\Controllers;

use App\Models\Claim;
use App\Models\Exam;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClaimController extends Controller
{
    // Show claim form for a specific exam
    public function create($exam, $type)
    {
        $exam = Exam::findOrFail($exam);
        // For API clients, return JSON instead of rendering a Blade view
        return response()->json(['exam' => $exam, 'type' => $type]);
    }

    // Store the claim (supports JSON requests from SPA)
    public function store(Request $request)
    {
        $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'exam_type' => 'required|string',
            'message' => 'required|string|max:2000'
        ]);

        // Determine teacher from Auth (web) or from provided matricule (API clients)
        $teacherId = Auth::id();
        $teacherName = Auth::user()?->name;

        if ($request->wantsJson() && $request->filled('teacher_matricule')) {
            $teacher = \App\Models\User::where('matricule', $request->teacher_matricule)->first();
            if ($teacher) {
                $teacherId = $teacher->id;
                $teacherName = $teacher->name;
            }
        }

        $claim = Claim::create([
            'exam_id' => $request->exam_id,
            'teacher_id' => $teacherId,
            'teacher_name' => $teacherName,
            'message' => $request->message,
            'exam_type' => $request->exam_type,
            'status' => 'pending'
        ]);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Claim created', 'claim' => $claim], 201);
        }

        return redirect()->route('dashboard')->with('success', 'Claim submitted successfully!');
    }

    // Admin: View all claims (returns HTML or JSON)
    public function index(Request $request)
    {
        $claims = Claim::with(['exam', 'teacher'])
            ->orderBy('status', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Always return JSON for claims in this controller
        return response()->json(['claims' => $claims]);
    }

    // Admin: Update claim (used by API to change status or add admin notes)
    public function update(Request $request, $id)
    {
        $claim = Claim::findOrFail($id);

        $claim->update($request->only(['status']));

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Claim updated', 'claim' => $claim]);
        }

        return redirect()->back()->with('success', 'Claim updated!');
    }

    // Admin: Delete claim
    public function destroy($id)
    {
        $claim = Claim::findOrFail($id);
        $claim->delete();
        
        if (request()->wantsJson()) {
            return response()->json(['message' => 'Claim deleted']);
        }

        return redirect()->back()->with('success', 'Claim deleted successfully!');
    }
}