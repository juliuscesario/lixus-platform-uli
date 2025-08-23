<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // In the new migration file inside database/migrations/

    public function up(): void
    {
        Schema::table('influencer_profiles', function (Blueprint $table) {
            $table->unsignedBigInteger('tiktok_follower_count')->default(0)->after('bio');
            $table->unsignedBigInteger('tiktok_likes_count')->default(0)->after('tiktok_follower_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('influencer_profiles', function (Blueprint $table) {
            //
        });
    }
};
