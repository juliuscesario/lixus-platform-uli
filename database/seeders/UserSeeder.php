<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role; // Import model Role
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str; // Untuk UUID

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan roles sudah ada di database atau buat di sini
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['id' => (string) Str::uuid()]);
        $influencerRole = Role::firstOrCreate(['name' => 'influencer'], ['id' => (string) Str::uuid()]);
        $brandRole = Role::firstOrCreate(['name' => 'brand'], ['id' => (string) Str::uuid()]); // <-- Pastikan role 'brand' ada

        // Admin User
        User::firstOrCreate(
            ['email' => 'admin@lixus.id'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Admin Lixus',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id, // Assign admin role
                'email_verified_at' => now(),
            ]
        );

        // Influencer Users
        User::firstOrCreate(
            ['email' => 'influencerA@example.com'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Influencer A',
                'password' => Hash::make('password'),
                'role_id' => $influencerRole->id, // Assign influencer role
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'influencerB@example.com'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Influencer B',
                'password' => Hash::make('password'),
                'role_id' => $influencerRole->id,
                'email_verified_at' => now(),
            ]
        );

        // Brand User <-- INI YANG PENTING
        User::firstOrCreate(
            ['email' => 'brand@lixus.id'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Brand Lixus', // Atau nama brand spesifik
                'password' => Hash::make('password'),
                'role_id' => $brandRole->id, // Assign brand role
                'email_verified_at' => now(),
            ]
        );

        // Generate 50 additional influencer users using the factory
        User::factory(50)->create([
            'role_id' => $influencerRole->id,
        ]);
    }
}