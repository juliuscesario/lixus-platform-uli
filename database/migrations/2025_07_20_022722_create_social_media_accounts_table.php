<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint; // Koreksi: Menggunakan backslash
use Illuminate\Support\Facades\Schema;   // Koreksi: Menggunakan backslash

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // ...
    public function up(): void
    {
        Schema::create('social_media_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Ganti dari $table->id()
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade'); // Ganti dari foreignId
            $table->string('platform'); // e.g., instagram, tiktok
            $table->string('platform_user_id')->unique(); // ID unik dari platform (contoh: ID Instagram user)
            $table->string('username');
            $table->text('access_token'); // Token akses untuk API platform
            $table->timestamp('token_expires_at')->nullable();
            $table->string('instagram_business_account_id')->nullable(); // Hanya untuk Instagram
            $table->string('facebook_page_id')->nullable(); // Hanya untuk Instagram
            $table->timestamps();
        });
    }
    // ...

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_media_accounts');
    }
};