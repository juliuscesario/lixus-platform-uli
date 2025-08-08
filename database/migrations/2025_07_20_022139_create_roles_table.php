<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id(); // Kolom ID auto-increment (primary key)
            $table->string('name')->unique(); // Nama peran (e.g., 'admin', 'influencer'), harus unik
            $table->timestamps(); // Kolom `created_at` dan `updated_at` otomatis
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles'); // Rollback: hapus tabel jika migrasi di-rollback
    }
};