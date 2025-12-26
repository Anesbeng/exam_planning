<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Claim extends Model
{
    protected $fillable = [
        'exam_id',
        'teacher_id',
        'teacher_name',
        'message',
        'exam_type',
        'status'
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
