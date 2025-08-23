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
        $influencers = \App\Models\User::whereHas('role', function ($query) {
            $query->where('name', 'influencer');
        })->get();

        foreach ($influencers as $influencer) {
            \App\Models\InfluencerProfile::firstOrCreate(
                ['user_id' => $influencer->id],
                [
                    'id' => Str::uuid(),
                    'bio' => 'Influencer profile for ' . $influencer->name,
                    'follower_range' => ['Micro', 'Mid', 'Macro', 'Mega'][array_rand(['Micro', 'Mid', 'Macro', 'Mega'])],
                    'gender' => ['Male', 'Female'][array_rand(['Male', 'Female'])],
                    'date_of_birth' => now()->subYears(rand(18, 35))->format('Y-m-d'),
                    'city' => ['Jakarta', 'Surabaya', 'Bandung', 'Yogyakarta', 'Medan'][array_rand(['Jakarta', 'Surabaya', 'Bandung', 'Yogyakarta', 'Medan'])],
                    'contact_email' => 'contact.' . Str::slug($influencer->name) . '@example.com',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}