<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('social_media_accounts', function (Blueprint $table) {
            // Add the new column, allowing it to be null for existing records
            $table->string('account_id')->after('platform')->nullable();
            
            $table->index('account_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('social_media_accounts', function (Blueprint $table) {
            $table->dropColumn('account_id');
        });
    }
};