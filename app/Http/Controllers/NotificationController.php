<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    /**
     * Get all notifications for a teacher
     */
    public function getTeacherNotifications($matricule)
    {
        try {
            // ✅ FIXED: All exams are in 'exams' table, differentiated by 'type' field
            $notifications = DB::select("
                SELECT 
                    n.*,
                    e.module,
                    e.date as exam_date,
                    e.start_time,
                    e.end_time,
                    e.room,
                    e.niveau,
                    e.group as exam_group,
                    e.type as exam_type_db
                FROM notifications n
                LEFT JOIN exams e ON n.exam_id = e.id
                WHERE n.teacher_matricule = ?
                ORDER BY n.created_at DESC
                LIMIT 50
            ", [$matricule]);

            // Format notifications with exam details
            $formattedNotifications = array_map(function($notif) {
                return [
                    'id' => $notif->id,
                    'teacher_matricule' => $notif->teacher_matricule,
                    'exam_id' => $notif->exam_id,
                    'exam_type' => $notif->exam_type,
                    'message' => $notif->message,
                    'is_read' => (bool)$notif->is_read,
                    'created_at' => $notif->created_at,
                    'exam_details' => $notif->module ? [
                        'module' => $notif->module,
                        'date' => $notif->exam_date,
                        'start_time' => $notif->start_time,
                        'end_time' => $notif->end_time,
                        'room' => $notif->room,
                        'niveau' => $notif->niveau,
                        'group' => $notif->exam_group
                    ] : null
                ];
            }, $notifications);

            return response()->json([
                'notifications' => $formattedNotifications
            ]);
        } catch (\Exception $e) {
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

            return response()->json([
                'message' => 'Notification marked as read'
            ]);
        } catch (\Exception $e) {
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
            Notification::where('teacher_matricule', $matricule)
                ->where('is_read', false)
                ->update(['is_read' => true]);

            return response()->json([
                'message' => 'All notifications marked as read'
            ]);
        } catch (\Exception $e) {
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
                'exam_type' => 'required|in:exam,cc,rattrapage',
                'message' => 'required|string'
            ]);

            $notification = Notification::create($validated);

            return response()->json([
                'message' => 'Notification created successfully',
                'notification' => $notification
            ], 201);
        } catch (\Exception $e) {
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

            return response()->json([
                'message' => 'Notification deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}