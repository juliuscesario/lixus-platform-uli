<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Post; // Import model Post
use App\Models\User; // Import model User
use App\Models\Campaign; // Import model Campaign
use App\Models\SocialMediaAccount; // Import model SocialMediaAccount

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan ada setidaknya 2 influencer, 2 campaign, dan beberapa social media accounts
        // Jika tidak ada, factory akan mencoba membuat atau mengambil yang pertama.
        if (User::whereHas('role', fn($q) => $q->where('name', 'influencer'))->count() < 2) {
            $this->command->error("Not enough influencers for PostSeeder. Please run UserSeeder with more influencers.");
            return;
        }
        if (Campaign::count() < 2) {
            $this->command->error("Not enough campaigns for PostSeeder. Please run CampaignSeeder with more campaigns.");
            return;
        }
        if (SocialMediaAccount::count() < 2) {
            $this->command->error("Not enough social media accounts for PostSeeder. Please run SocialMediaAccountSeeder with more accounts.");
            return;
        }

        // Hapus post lama jika ada untuk menghindari duplikasi saat seeding ulang (opsional)
        // Post::truncate(); // Hati-hati: ini akan menghapus semua post yang ada

        // Buat 60 post baru menggunakan factory
        Post::factory(60)->create();

        $this->command->info('60 posts created successfully.');
    }
}