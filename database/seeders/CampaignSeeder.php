<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str; // Tambahkan ini

class CampaignSeeder extends Seeder
{
    public function run(): void
    {
        // Generate UUIDs for campaigns
        $campaign1Id = Str::uuid();
        $campaign2Id = Str::uuid();
        $campaign3Id = Str::uuid();

        $brandId = DB::table('users')->where('email', 'brand@lixus.id')->first();
        DB::table('campaigns')->insert([
            [
                'id' => $campaign1Id,
                'name' => 'Pepsodent Senyum Indonesia',
                'description' => 'Kampanye digital untuk mempromosikan senyum sehat dengan Pepsodent.',
                'brand_id' => $brandId->id,
                'start_date' => '2025-07-20',
                'end_date' => '2025-08-20',
                'budget' => 5000000.00,
                'briefing_content' => json_encode([
                    'goals' => 'Meningkatkan brand awareness dan engagement.',
                    'hashtags' => ['#PepsodentSenyumIndonesia', '#GigiSehatPepsodent'],
                    'mentions' => ['@PepsodentID'],
                    'content_type' => ['foto', 'video singkat'],
                    'kpi' => 'Likes, Comments, Shares, Reach',
                    'target_audience' => 'Generasi muda',
                ]),
                'scoring_rules' => json_encode([
                    'instagram' => [
                        'likes_point' => 0.01,
                        'comments_point' => 0.05,
                        'shares_point' => 0.1,
                    ],
                    'tiktok' => [
                        'likes_point' => 0.02,
                        'comments_point' => 0.06,
                        'shares_point' => 0.15,
                    ],
                    'hashtag_bonus' => 5,
                    'mention_bonus' => 10,
                ]),
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $campaign2Id,
                'name' => 'Unilever Bersih-Bersih Lingkungan',
                'description' => 'Kampanye sosial untuk mengajak masyarakat menjaga kebersihan lingkungan.',
                'brand_id' => $brandId->id,
                'budget' => 5000000.00,
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
                    'instagram' => [
                        'likes_point' => 0.005,
                        'comments_point' => 0.02,
                        'shares_point' => 0.08,
                    ],
                    'tiktok' => [
                        'likes_point' => 0.01,
                        'comments_point' => 0.03,
                        'shares_point' => 0.1,
                    ],
                    'hashtag_bonus' => 3,
                    'mention_bonus' => 7,
                ]),
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $campaign3Id,
                'name' => 'Lifebuoy Lindungi Keluarga',
                'description' => 'Kampanye promosi sabun Lifebuoy untuk perlindungan keluarga dari kuman.',
                'brand_id' => $brandId->id,
                'budget' => 3500000.00,
                'start_date' => '2025-09-01',
                'end_date' => '2025-10-01',
                'briefing_content' => json_encode([
                    'goals' => 'Meningkatkan penjualan dan brand loyalty.',
                    'hashtags' => ['#LifebuoyLindungiKeluarga', '#KeluargaSehatLifebuoy'],
                    'mentions' => ['@LifebuoyID'],
                    'content_type' => ['foto', 'video pendek'],
                    'kpi' => 'Sales Conversion, Repeat Purchase',
                    'target_audience' => 'Orang tua, keluarga muda',
                ]),
                'scoring_rules' => json_encode([
                    'instagram' => [
                        'likes_point' => 0.015,
                        'comments_point' => 0.06,
                        'shares_point' => 0.12,
                    ],
                    'tiktok' => [
                        'likes_point' => 0.025,
                        'comments_point' => 0.07,
                        'shares_point' => 0.18,
                    ],
                    'hashtag_bonus' => 6,
                    'mention_bonus' => 12,
                ]),
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}