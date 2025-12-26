<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ApiResetPasswordNotification extends ResetPassword
{
    public function toMail($notifiable)
    {
        $url = "http://localhost:3000/reset-password"
             . "?token={$this->token}"
             . "&email={$notifiable->email}";

        return (new MailMessage)
            ->subject('Reset Password')
            ->line('You requested a password reset.')
            ->action('Reset Password', $url)
            ->line('If you did not request this, ignore this email.');
    }
}
