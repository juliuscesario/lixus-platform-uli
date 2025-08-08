<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->uuid('id')->primary(); // UUID sebagai primary key
            $table->uuid('campaign_id');
            $table->uuid('user_id'); // ID Influencer
            $table->uuid('social_media_account_id')->nullable(); // ID Akun Media Sosial

            $table->string('platform'); // instagram, tiktok, youtube, facebook, twitter
            $table->string('platform_post_id')->nullable(); // ID asli dari platform sosmed
            $table->string('post_type')->nullable(); // feed_photo, video, story, reel, dll.
            $table->string('post_url', 2048)->unique(); // URL postingan
            $table->string('media_url', 2048)->unique(); // Media URL postingan
            $table->text('caption')->nullable();
            $table->jsonb('raw_data')->nullable(); // Data mentah dari API platform sosmed

            // Kolom untuk Metrik dan Skor (JSONB dan Decimal)
            $table->jsonb('metrics')->nullable(); // Menyimpan semua metrik (likes, comments, etc.) sebagai JSON
            $table->decimal('score', 8, 2)->nullable(); // Skor hasil perhitungan

            $table->timestamp('posted_at'); // Waktu postingan di media sosial

            $table->timestamps();

            $table->foreign('campaign_id')->references('id')->on('campaigns')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('social_media_account_id')->references('id')->on('social_media_accounts')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};