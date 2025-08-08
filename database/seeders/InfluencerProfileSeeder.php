<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str; // Tambahkan ini

class InfluencerProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil user ID yang sudah menjadi UUID dari UserSeeder
        $influencerA = DB::table('users')->where('email', 'influencerA@example.com')->first();
        $influencerB = DB::table('users')->where('email', 'influencerB@example.com')->first();

        DB::table('influencer_profiles')->insert([
            [
                'id' => Str::uuid(), // <-- Tambahkan UUID untuk primary key profile
                'user_id' => $influencerA->id, // <-- Gunakan UUID dari user
                'bio' => 'Fashion & lifestyle enthusiast. Sharing daily inspirations.',
                'follower_range' => 'Micro',
                'gender' => 'Female',
                'date_of_birth' => '1995-05-10',
                'city' => 'Jakarta',
                'contact_email' => 'contact.influencerA@example.com',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(), // <-- Tambahkan UUID untuk primary key profile
                'user_id' => $influencerB->id, // <-- Gunakan UUID dari user
                'bio' => 'Travel blogger and food explorer. Join me on my adventures!',
                'follower_range' => 'Mid',
                'gender' => 'Male',
                'date_of_birth' => '1990-11-20',
                'city' => 'Surabaya',
                'contact_email' => 'contact.influencerB@example.com',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}