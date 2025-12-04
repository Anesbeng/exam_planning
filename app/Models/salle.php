<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class salle extends Model
{
    protected $fillable = ['name', 'capacity', 'location'];
}
