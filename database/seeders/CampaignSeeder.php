<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str; // Tambahkan ini

class CampaignSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Generate UUIDs for campaigns
        $campaign1Id = Str::uuid();
        $campaign2Id = Str::uuid();

        $brandId = DB::table('users')->where('email', 'brand@lixus.id')->first();
        DB::table('campaigns')->insert([
            [
                'id' => $campaign1Id, // <-- Tambahkan UUID
                'name' => 'Pepsodent Senyum Indonesia',
                'description' => 'Kampanye digital untuk mempromosikan senyum sehat dengan Pepsodent.',
                'brand_id' => $brandId->id, // <-- Gunakan UUID dari user brand
                'start_date' => '2025-07-20',
                'end_date' => '2025-08-20',
                'budget' => 5000000.00, // Budget dalam format desimal
                'briefing_content' => json_encode([
                    'goals' => 'Meningkatkan brand awareness dan engagement.',
                    'hashtags' => ['#PepsodentSenyumIndonesia', '#GigiSehatPepsodent'],
                    'mentions' => ['@PepsodentID'],
                    'content_type' => ['foto', 'video singkat'],
                    'kpi' => 'Likes, Comments, Shares, Reach',
                    'target_audience' => 'Generasi muda',
                ]),
                'scoring_rules' => json_encode([
                    'likes_point' => 0.01,
                    'comments_point' => 0.05,
                    'shares_point' => 0.1,
                    'hashtag_bonus' => 5, // Bonus per hashtag yang digunakan
                    'mention_bonus' => 10, // Bonus per mention yang digunakan
                ]),
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $campaign2Id, // <-- Tambahkan UUID
                'name' => 'Unilever Bersih-Bersih Lingkungan',
                'description' => 'Kampanye sosial untuk mengajak masyarakat menjaga kebersihan lingkungan.',
                'brand_id' => $brandId->id, // <-- Gunakan UUID dari user brand
                'budget' => 5000000.00, // Budget dalam format desimal
                'start_date' => '2025-08-01',
                'end_date' => '2025-09-01',
                'briefing_content' => json_encode([
                    'goals' => 'Meningkatkan kesadaran lingkungan.',
                    'hashtags' => ['#UnileverPeduliLingkungan'],
                    'mentions' => ['@UnileverID'],
                    'content_type' => ['foto', 'video'],
                    'kpi' => 'Reach, Impressions',
                    'target_audience' => 'Masyarakat umum',
                ]),
                'scoring_rules' => json_encode([
                    'likes_point' => 0.005,
                    'comments_point' => 0.02,
                    'shares_point' => 0.08,
                    'hashtag_bonus' => 3,
                    'mention_bonus' => 7,
                ]),
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}