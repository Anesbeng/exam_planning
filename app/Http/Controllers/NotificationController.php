<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Get all notifications for a teacher
     */
    public function getTeacherNotifications($matricule)
    {
        try {
            Log::info("🔍 Fetching notifications for teacher: {$matricule}");

            // ✅ FIXED: Using Eloquent instead of raw SQL to avoid JOIN issues
            $notifications = Notification::where('teacher_matricule', $matricule)
                ->orderBy('created_at', 'DESC')
                ->limit(50)
                ->get();

            Log::info("📊 Found {$notifications->count()} notifications");

            // Format notifications with exam details
            $formattedNotifications = $notifications->map(function($notif) {
                // Get exam details separately
                $examDetails = null;
                if ($notif->exam_id) {
                    $exam = DB::table('exams')->where('id', $notif->exam_id)->first();
                    if ($exam) {
                        $examDetails = [
                            'module' => $exam->module,
                            'date' => $exam->date,
                            'start_time' => $exam->start_time,
                            'end_time' => $exam->end_time,
                            'room' => $exam->room,
                            'niveau' => $exam->niveau,
                            'group' => $exam->group
                        ];
                    }
                }

                return [
                    'id' => $notif->id,
                    'teacher_matricule' => $notif->teacher_matricule,
                    'exam_id' => $notif->exam_id,
                    'exam_type' => $notif->exam_type,
                    'message' => $notif->message,
                    'is_read' => (bool)$notif->is_read,
                    'created_at' => $notif->created_at,
                    'exam_details' => $examDetails
                ];
            });

            Log::info("✅ Returning formatted notifications");

            return response()->json([
                'notifications' => $formattedNotifications
            ]);
        } catch (\Exception $e) {
            Log::error("❌ Error fetching notifications: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Error fetching notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead($id)
    {
        try {
            $notification = Notification::findOrFail($id);
            $notification->is_read = true;
            $notification->save();

            Log::info("✅ Notification {$id} marked as read");

            return response()->json([
                'message' => 'Notification marked as read'
            ]);
        } catch (\Exception $e) {
            Log::error("❌ Error marking notification as read: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Error updating notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all notifications as read for a teacher
     */
    public function markAllAsRead($matricule)
    {
        try {
            $updated = Notification::where('teacher_matricule', $matricule)
                ->where('is_read', false)
                ->update(['is_read' => true]);

            Log::info("✅ Marked {$updated} notifications as read for teacher {$matricule}");

            return response()->json([
                'message' => 'All notifications marked as read',
                'count' => $updated
            ]);
        } catch (\Exception $e) {
            Log::error("❌ Error marking all as read: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Error updating notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new notification
     */
    public function create(Request $request)
    {
        try {
            $validated = $request->validate([
                'teacher_matricule' => 'required|string',
                'exam_id' => 'required|integer',
                'exam_type' => 'required|in:examen,cc,rattrapage',
                'message' => 'required|string'
            ]);

            $notification = Notification::create($validated);

            Log::info("✅ Notification created: {$notification->id}");

            return response()->json([
                'message' => 'Notification created successfully',
                'notification' => $notification
            ], 201);
        } catch (\Exception $e) {
            Log::error("❌ Error creating notification: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Error creating notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a notification
     */
    public function delete($id)
    {
        try {
            $notification = Notification::findOrFail($id);
            $notification->delete();

            Log::info("✅ Notification {$id} deleted");

            return response()->json([
                'message' => 'Notification deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error("❌ Error deleting notification: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Error deleting notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}