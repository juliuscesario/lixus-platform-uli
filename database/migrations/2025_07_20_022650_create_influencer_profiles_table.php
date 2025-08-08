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
    Schema::create('influencer_profiles', function (Blueprint $table) {
        $table->uuid('id')->primary(); // Ganti dari $table->id()
        $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade'); // Ganti dari foreignId
        $table->text('bio')->nullable();
        $table->string('follower_range')->nullable(); // e.g., Nano, Micro, Mid, Macro, Mega
        $table->string('gender')->nullable(); // e.g., Male, Female, Other
        $table->date('date_of_birth')->nullable();
        $table->string('city')->nullable();
        $table->string('contact_email')->nullable();
        $table->timestamps();
    });
}
// ...

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('influencer_profiles');
    }
};