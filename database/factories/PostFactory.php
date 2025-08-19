<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\Campaign;
use App\Models\User;
use App\Models\SocialMediaAccount;
use App\Models\CampaignParticipant; // Import CampaignParticipant
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PostFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Post::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // 1. Ambil partisipan yang sudah diapprove secara acak
        $participant = CampaignParticipant::where('status', 'approved')
                                          ->inRandomOrder()
                                          ->first();

        // Jika tidak ada partisipan yang diapprove, kita tidak bisa membuat post
        if (!$participant) {
            // Kita bisa mengembalikan array kosong atau throw exception jika seeder harusnya menjamin ada partisipan
            return [];
        }
        
        // 2. Dapatkan campaign dan influencer dari partisipan
        $campaign = $participant->campaign;
        $influencer = $participant->user;

        // 3. Ambil akun media sosial milik influencer tersebut
        $socialMediaAccount = SocialMediaAccount::where('user_id', $influencer->id)
                                                ->inRandomOrder()
                                                ->first();
        
        // Jika influencer tidak punya social media account, kita tidak bisa membuat post
        if (!$socialMediaAccount) {
            return [];
        }

        // 4. Gunakan platform dari social media account yang terpilih
        $platform = $socialMediaAccount->platform;
        $postType = $this->faker->randomElement(['feed_photo', 'feed_video', 'story', 'reel']);
        
        // 5. Pastikan tanggal post berada dalam rentang waktu campaign
        $postedAt = $this->faker->dateTimeBetween($campaign->start_date, $campaign->end_date);

        $metrics = [
            'likes_count' => $this->faker->numberBetween(100, 50000),
            'comments_count' => $this->faker->numberBetween(5, 1000),
            'shares_count' => $this->faker->numberBetween(0, 200),
            'views_count' => $this->faker->numberBetween(1000, 200000),
            'reach_count' => $this->faker->numberBetween(500, 100000),
            'impressions_count' => $this->faker->numberBetween(1000, 250000),
            'taps_forward_count' => $this->faker->numberBetween(0, 50),
            'taps_back_count' => $this->faker->numberBetween(0, 20),
            'exits_count' => $this->faker->numberBetween(0, 30),
            'replies_count' => $this->faker->numberBetween(0, 100),
        ];

        return [
            'id' => Str::uuid(),
            'campaign_id' => $campaign->id,
            'user_id' => $influencer->id,
            'social_media_account_id' => $socialMediaAccount->id,
            'platform' => $platform,
            'platform_post_id' => Str::random(20),
            'post_type' => $postType,
            'post_url' => $this->faker->url() . '?' . Str::uuid(),
            'media_url' => $this->faker->imageUrl() . '?' . Str::uuid(),
            'caption' => $this->faker->sentence(rand(5, 15)) . ' #' . $this->faker->word() . ' #' . $this->faker->word(),
            'raw_data' => ['api_response_mock' => $this->faker->sentence()],
            'metrics' => $metrics,
            'score' => null, // Akan dihitung oleh ScoreSeeder
            'posted_at' => $postedAt,
            'is_valid_for_campaign' => $this->faker->boolean(80),
            'validation_notes' => $this->faker->boolean(20) ? $this->faker->sentence(5) : null,
        ];
    }

    /**
     * Configure the factory to use a specific CampaignParticipant.
     *
     * @param  \App\Models\CampaignParticipant  $participant
     * @return static
     */
    public function withParticipant(\App\Models\CampaignParticipant $participant): static
    {
        return $this->state(function (array $attributes) use ($participant) {
            // Override the default definition logic to use the provided participant
            $campaign = $participant->campaign;
            $influencer = $participant->user;

            // Ambil akun media sosial milik influencer tersebut
            $socialMediaAccount = \App\Models\SocialMediaAccount::where('user_id', $influencer->id)
                                                            ->inRandomOrder()
                                                            ->first();

            // Jika influencer tidak punya social media account, kita tidak bisa membuat post
            if (!$socialMediaAccount) {
                // Ini harusnya tidak terjadi jika data sudah disiapkan dengan baik
                // Tapi untuk amannya, kita bisa return array kosong atau throw exception
                // Untuk factory, lebih baik kembalikan state yang tidak valid atau biarkan faker yang handle jika null
                return [];
            }

            // Pastikan tanggal post berada dalam rentang waktu campaign dari participant yang diberikan
            $postedAt = $this->faker->dateTimeBetween($campaign->start_date, $campaign->end_date);

            return [
                'campaign_id' => $campaign->id,
                'user_id' => $influencer->id,
                'social_media_account_id' => $socialMediaAccount->id,
                'platform' => $socialMediaAccount->platform,
                'posted_at' => $postedAt,
            ];
        });
    }
}