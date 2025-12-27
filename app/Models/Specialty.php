<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Specialty extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name'
    ];

    public function groups()
    {
        return $this->hasMany(Group::class);
    }
}