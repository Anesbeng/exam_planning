<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
protected $fillable = [
    'type',
    'module',
    'teacher',
    'room',
    'specialite',
    'niveau',
    'group',
    'semester',
    'date',
    'start_time',
    'end_time',
];

}