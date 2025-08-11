@component('mail::message')
# Welcome to the Platform, {{ $user->name }}!

Your application to join our influencer platform has been approved.

Here are your login credentials:
- **Email:** {{ $user->email }}
- **Password:** {{ $password }}

We recommend that you change your password after logging in for the first time.

Thanks,<br>
{{ config('app.name') }}
@endcomponent