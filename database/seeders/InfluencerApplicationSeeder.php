<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InfluencerApplication;
use Faker\Factory as Faker;

class InfluencerApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        for ($i = 0; $i < 15; $i++) {
            $email = $faker->unique()->safeEmail;
            if (InfluencerApplication::where('email', $email)->exists()) {
                continue;
            }

            $profiles = [];
            $platforms = ['instagram', 'tiktok', 'youtube', 'facebook'];
            shuffle($platforms);
            $numberOfProfiles = $faker->numberBetween(1, 2);
            
            for ($j = 0; $j < $numberOfProfiles; $j++) {
                // --- THIS IS THE SECTION TO UPDATE ---
                $profiles[] = [
                    'platform' => array_pop($platforms),
                    'username' => $faker->userName,
                    'followers' => $faker->numberBetween(5000, 200000),
                    // --- ADD THESE NEW FIELDS ---
                    'account_created_date' => $faker->dateTimeBetween('-5 years', '-1 year')->format('Y-m-d'),
                    'total_posts' => $faker->numberBetween(50, 1500),
                    'total_following' => $faker->numberBetween(100, 2000),
                ];
                // --- END OF UPDATE ---
            }
            
            InfluencerApplication::create([
                'name' => $faker->name,
                'email' => $email,
                'gender' => $faker->randomElement(['Male', 'Female']),
                'date_of_birth' => $faker->dateTimeBetween('-30 years', '-18 years')->format('Y-m-d'),
                'city' => $faker->city,
                'bio' => $faker->paragraph(3),
                'social_media_profiles' => $profiles,
                'status' => 'pending',
            ]);
        }
    }
}