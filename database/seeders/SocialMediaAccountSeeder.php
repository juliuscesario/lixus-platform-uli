<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str; // Tambahkan ini
use Illuminate\Support\Facades\Hash; // Tambahkan ini, jika Anda tetap ingin hash access_token (tidak disarankan untuk token API)

class SocialMediaAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $influencers = \App\Models\User::whereHas('role', function ($query) {
            $query->where('name', 'influencer');
        })->get();

        if ($influencers->isEmpty()) {
            $this->command->error("No influencer users found. Please run UserSeeder first.");
            return;
        }

        foreach ($influencers as $influencer) {
            // Add Instagram account
            \App\Models\SocialMediaAccount::firstOrCreate(
                ['user_id' => $influencer->id, 'platform' => 'instagram'],
                [
                    'id' => Str::uuid(),
                    'platform_user_id' => Str::random(16, 'alnum'),
                    'username' => Str::slug($influencer->name) . '_insta',
                    'access_token' => Str::random(60),
                    'token_expires_at' => now()->addDays(60),
                    'instagram_business_account_id' => Str::random(16, 'alnum'),
                    'facebook_page_id' => Str::random(16, 'alnum'),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // Add TikTok account
            \App\Models\SocialMediaAccount::firstOrCreate(
                ['user_id' => $influencer->id, 'platform' => 'tiktok'],
                [
                    'id' => Str::uuid(),
                    'platform_user_id' => Str::random(20, 'alnum'),
                    'username' => Str::slug($influencer->name) . '_tiktok',
                    'access_token' => Str::random(60),
                    'token_expires_at' => now()->addDays(90),
                    'instagram_business_account_id' => null,
                    'facebook_page_id' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}