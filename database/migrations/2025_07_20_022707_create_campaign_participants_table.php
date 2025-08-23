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
        Schema::create('campaign_participants', function (Blueprint $table) {
            $table->id(); // Ini tetap integer auto-increment untuk tabel pivot itu sendiri
            $table->foreignUuid('campaign_id')->constrained('campaigns')->onDelete('cascade'); // <-- GANTI KE foreignUuid
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');       // <-- GANTI KE foreignUuid
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed','withdrawn'])->default('pending');
            $table->timestamp('applied_at')->nullable(); // Waktu saat influencer mendaftar
            $table->timestamp('approved_at')->nullable(); // Waktu saat influencer disetujui
            $table->timestamp('rejected_at')->nullable(); // Waktu saat influencer ditolak
            $table->timestamp('completed_at')->nullable(); // Waktu saat influencer menyelesaikan kampanye
            $table->timestamp('withdrawn_at')->nullable(); // Waktu saat influencer menarik diri dari kampanye
            $table->timestamps();

            $table->unique(['campaign_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaign_participants');
    }
};