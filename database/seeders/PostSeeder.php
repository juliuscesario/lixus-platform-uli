<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Post; // Import model Post
use App\Models\User; // Import model User
use App\Models\Campaign; // Import model Campaign
use App\Models\SocialMediaAccount; // Import model SocialMediaAccount
use App\Models\CampaignParticipant; // Import model CampaignParticipant

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

        // Hapus post lama jika ada untuk menghindari duplikasi saat seeding ulang (opsional)
        Post::truncate(); // Hati-hati: ini akan menghapus semua post yang ada

        // Ambil semua partisipan yang sudah diapprove
        $approvedParticipants = CampaignParticipant::where('status', 'approved')->get();

        if ($approvedParticipants->isEmpty()) {
            $this->command->warn("No approved campaign participants found. Skipping post creation.");
            return;
        }

        $totalPostsCreated = 0;
        foreach ($approvedParticipants as $participant) {
            // Buat sejumlah post acak (misal: 1 sampai 5) untuk setiap partisipan
            $numberOfPosts = 60;
            Post::factory($numberOfPosts)->withParticipant($participant)->create();
            $totalPostsCreated += $numberOfPosts;
        }

        $this->command->info("{$totalPostsCreated} posts created successfully.");

        $this->command->info('60 posts created successfully.');
    }
}