<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint; // Koreksi: Menggunakan backslash
use Illuminate\Support\Facades\Schema;   // Koreksi: Menggunakan backslash

return new class extends Migration
{
    // ...
    public function up(): void
    {
        Schema::create('scores', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Ganti dari $table->id()
            $table->foreignUuid('post_id')->constrained('posts')->onDelete('cascade'); // Ganti dari foreignId
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade'); // Ganti dari foreignId
            $table->foreignUuid('campaign_id')->constrained('campaigns')->onDelete('cascade'); // Ganti dari foreignId
            $table->double('score_value');
            $table->jsonb('score_details')->nullable();
            $table->timestamps();
        });
    }
    // ...

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scores');
    }
};