<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {       
         // Panggil seeder dalam urutan yang benar sesuai dependensi
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            CampaignSeeder::class,
            InfluencerProfileSeeder::class,
            CampaignParticipantSeeder::class, // Membutuhkan Campaign dan User
            SocialMediaAccountSeeder::class,  // Membutuhkan User
            PostSeeder::class,                // Membutuhkan Campaign, User, SocialMediaAccount
            ScoreSeeder::class,               // Membutuhkan Post, Campaign, User
        ]);
    }
}
