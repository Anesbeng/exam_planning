<?php
// app/Models/Notification.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_matricule',
        'exam_id',
        'exam_type',
        'message',
        'is_read'
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationship with user (teacher)
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_matricule', 'matricule');
    }
}