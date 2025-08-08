<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint; // Koreksi: Menggunakan backslash
use Illuminate\Support\Facades\Schema;   // Koreksi: Menggunakan backslash

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary(); // UUID for primary key
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->uuid('brand_id'); // Kolom brand_id (UUID)
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('budget', 15, 2);
            $table->json('briefing_content')->nullable(); // Store as JSON
            $table->json('scoring_rules')->nullable();   // Store as JSON
            $table->string('status')->default('draft'); // draft, pending, active, completed, cancelled
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('brand_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};