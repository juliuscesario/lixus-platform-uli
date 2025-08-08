<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; // Pastikan ini di-import

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('roles')->insert([
            ['name' => 'admin', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'influencer', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'brand', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}