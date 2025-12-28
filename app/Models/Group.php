<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'level_id',
        'specialty_id'
    ];

    public function level()
    {
        return $this->belongsTo(Level::class);
    }

    public function specialty()
    {
        return $this->belongsTo(Specialty::class);
    }

    public function students()
    {
        return $this->hasMany(User::class, 'groupe', 'id');
    }
}