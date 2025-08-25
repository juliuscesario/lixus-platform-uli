<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\InfluencerWelcomeEmail;

class EmailService
{
    /**
     * Send a welcome email to a new influencer with their credentials.
     *
     * @param \App\Models\User $user
     * @param string $password
     * @return void
     */
    public function sendInfluencerWelcomeEmail(User $user, string $password): void
    {
        Mail::to($user->email)->send(new InfluencerWelcomeEmail($user, $password));
    }
}