<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        //
    ];

    public function boot()
    {
        $this->registerPolicies();

        // ✅ React reset password URL
        ResetPassword::createUrlUsing(function ($user, string $token) {
            return "http://localhost:3000/reset-password?token={$token}&email={$user->email}";
        });
    }
}
