<?php



namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Auth\Passwords\CanResetPassword;
use App\Notifications\ApiResetPasswordNotification;

class User extends Authenticatable
{

public function sendPasswordResetNotification($token)
{
    $this->notify(new ApiResetPasswordNotification($token));
}

    use HasFactory, Notifiable , CanResetPassword;

    protected $fillable = [
        'matricule',
        'name',
        'email',
        'role',
        'password',
        'specialite',
        'niveau',
        'annee_scolaire',
        'groupe',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
}