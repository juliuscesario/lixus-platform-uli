<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\Campaign; // Import Campaign
use App\Models\User;     // Import User
use App\Models\SocialMediaAccount; // Import SocialMediaAccount
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
        // Ambil user influencer secara acak
        $influencer = User::whereHas('role', function ($query) {
            $query->where('name', 'influencer');
        })->inRandomOrder()->first();

        // Ambil campaign secara acak
        $campaign = Campaign::inRandomOrder()->first();

        // Ambil akun media sosial yang terkait dengan influencer yang dipilih
        $socialMediaAccount = null;
        if ($influencer) {
            $socialMediaAccount = SocialMediaAccount::where('user_id', $influencer->id)->inRandomOrder()->first();
        }

        $platform = $this->faker->randomElement(['instagram', 'tiktok']);
        $postType = $this->faker->randomElement(['feed_photo', 'feed_video', 'story', 'reel']);
        $postedAt = $this->faker->dateTimeBetween('-1 month', 'now');

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
            'id' => Str::uuid(), // Generate UUID
            'campaign_id' => $campaign ? $campaign->id : Campaign::inRandomOrder()->first()->id, // Fallback jika tidak ditemukan
            'user_id' => $influencer ? $influencer->id : User::whereHas('role', fn($q) => $q->where('name', 'influencer'))->inRandomOrder()->first()->id, // Fallback
            'social_media_account_id' => $socialMediaAccount ? $socialMediaAccount->id : SocialMediaAccount::inRandomOrder()->first()->id, // Fallback
            'platform' => $platform,
            'platform_post_id' => Str::random(20), // ID random dari platform
            'post_type' => $postType,
            'post_url' => $this->faker->url(),
            'media_url' => $this->faker->imageUrl(),
            'caption' => $this->faker->sentence(rand(5, 15)) . ' #' . $this->faker->word() . ' #' . $this->faker->word(),
            'raw_data' => json_encode(['api_response_mock' => $this->faker->sentence()]),
            'metrics' => json_encode($metrics),
            'score' => null, // Akan dihitung oleh ScoreSeeder
            'posted_at' => $postedAt,
            'is_valid_for_campaign' => $this->faker->boolean(80), // 80% kemungkinan valid
            'validation_notes' => $this->faker->boolean(20) ? $this->faker->sentence(5) : null,
        ];
    }
}