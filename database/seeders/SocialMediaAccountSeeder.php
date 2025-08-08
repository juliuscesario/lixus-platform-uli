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
        // Ambil user ID yang sudah menjadi UUID dari UserSeeder
        $influencerA = DB::table('users')->where('email', 'influencerA@example.com')->first();
        $influencerB = DB::table('users')->where('email', 'influencerB@example.com')->first();

        // Pastikan influencer A dan B ada
        if (!$influencerA || !$influencerB) {
            $this->command->error("Influencer users not found. Please run UserSeeder first.");
            return;
        }

        DB::table('social_media_accounts')->insert([
            [
                'id' => Str::uuid(), // <-- Tambahkan UUID
                'user_id' => $influencerA->id, // <-- Gunakan UUID dari user
                'platform' => 'instagram',
                'platform_user_id' => '1234567890123456', // Dummy Instagram User ID
                'username' => 'influencer_a_insta',
                // Untuk access_token, sebaiknya gunakan Str::random(60) saja,
                // atau enkripsi jika ini data sensitif. Hash::make() untuk password.
                'access_token' => Str::random(60), // Token dummy
                'token_expires_at' => now()->addDays(60), // Berlaku untuk 60 hari dari sekarang
                'instagram_business_account_id' => '9876543210987654', // Dummy Business Account ID
                'facebook_page_id' => '1122334455667788', // Dummy Facebook Page ID
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(), // <-- Tambahkan UUID
                'user_id' => $influencerA->id, // Influencer A juga punya TikTok
                'platform' => 'tiktok',
                'platform_user_id' => 'abcde12345fghij67890',
                'username' => 'influencer_a_tiktok',
                'access_token' => Str::random(60),
                'token_expires_at' => now()->addDays(90),
                'instagram_business_account_id' => null,
                'facebook_page_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(), // <-- Tambahkan UUID
                'user_id' => $influencerB->id, // <-- Gunakan UUID dari user
                'platform' => 'instagram',
                'platform_user_id' => '9988776655443322',
                'username' => 'influencer_b_insta',
                'access_token' => Str::random(60),
                'token_expires_at' => now()->addDays(30),
                'instagram_business_account_id' => '1231231231231231',
                'facebook_page_id' => '4564564564564564',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}