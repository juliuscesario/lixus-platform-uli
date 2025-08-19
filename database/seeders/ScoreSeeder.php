<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Post;
use App\Models\Campaign; // Pastikan diimpor

class ScoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $posts = Post::all();

        if ($posts->isEmpty()) {
            $this->command->warn("No posts found to calculate scores. Ensure PostSeeder runs first.");
            return;
        }

        foreach ($posts as $post) {
            // --- SOLUSI DEFENSIF UNTUK MEMASTIKAN $metrics ADALAH ARRAY ---
            $metrics = $post->metrics; // Ambil nilai dari model

            // Jika metrics masih berupa string (meskipun sudah di-cast), coba decode secara manual
            if (is_string($metrics)) {
                $decodedMetrics = json_decode($metrics, true); // Decode string JSON ke array
                if (json_last_error() === JSON_ERROR_NONE && is_array($decodedMetrics)) {
                    $metrics = $decodedMetrics; // Gunakan array yang sudah di-decode
                } else {
                    // Jika gagal decode atau bukan array, log peringatan dan lewati post ini
                    $this->command->warn("Post ID: {$post->id} has invalid metrics JSON string. Skipping score calculation.");
                    continue; // Lanjutkan ke post berikutnya
                }
            } elseif (!is_array($metrics)) {
                // Jika bukan string dan bukan array (misal null atau tipe lain), lewati
                $this->command->warn("Post ID: {$post->id} has non-array/non-string metrics. Skipping score calculation.");
                continue;
            }
            // --- AKHIR SOLUSI DEFENSIVE ---

            // $metrics sekarang dijamin berupa array jika kode mencapai sini
            if ($metrics) { // Pastikan array metrics tidak kosong
                // Ambil aturan scoring dari campaign terkait
                $campaign = $post->campaign; // Memuat relasi campaign
                // Pastikan campaign tidak null, jika relasi tidak ditemukan
                if (!$campaign) {
                    $this->command->warn("Post ID: {$post->id} has no associated campaign. Skipping score calculation.");
                    continue;
                }
                $scoringRules = $campaign->scoring_rules ?? [];

                // Hitung skor menggunakan logika sederhana
                $calculatedScore = $this->applyScoringRules($metrics, $scoringRules, $post->platform);

                // 1. Update the score directly on the post model
                $post->score = $calculatedScore;
                $checkingsave = $post->save();
                
                $this->command->info("Post ID: {$post->id} - save score {$calculatedScore} is {$checkingsave}");
                // 2. (Optional) Create a detailed Score record for logging/history
                \App\Models\Score::create([
                    'post_id' => $post->id,
                    'user_id' => $post->user_id,
                    'campaign_id' => $post->campaign_id,
                    'score_value' => $calculatedScore,
                    'score_details' => $metrics,
                ]);

                $this->command->info("Post ID: {$post->id} - Score updated to: {$calculatedScore}");
            } else {
                $this->command->warn("Post ID: {$post->id} has no metrics to calculate score.");
            }
        }
    }

    /**
     * Helper function to apply scoring rules.
     */
    protected function applyScoringRules(array $metrics, array $rules, string $platform): float
    {
        $score = 0;
        $platformRules = $rules[$platform] ?? [];

        // Default weights if not specified in rules
        $likeWeight = $platformRules['likes_point'] ?? 0;
        $commentWeight = $platformRules['comments_point'] ?? 0;
        $shareWeight = $platformRules['shares_point'] ?? 0;
        $viewWeight = $platformRules['views_point'] ?? 0;

        $score += ($metrics['likes_count'] ?? 0) * $likeWeight;
        $score += ($metrics['comments_count'] ?? 0) * $commentWeight;
        $score += ($metrics['shares_count'] ?? 0) * $shareWeight;
        $score += ($metrics['views_count'] ?? 0) * $viewWeight;

        return (float) max(0, $score);
    }
}