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
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // Hapus baris ini karena foreign key constraint ini tidak ada secara default
            // $table->dropForeign(['tokenable_id']);

            // Ubah tipe kolom tokenable_id menjadi UUID
            $table->uuid('tokenable_id')->change();

            // Tidak perlu menambahkan foreign key constraint di sini
            // karena Sanctum tidak secara default membuatnya, dan jika Anda menambahkannya,
            // itu akan memerlukan penanganan khusus di down() juga.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // Untuk rollback, ubah kembali ke unsignedBigInteger
            $table->unsignedBigInteger('tokenable_id')->change();

            // Tidak perlu menambahkan kembali foreign key constraint lama
            // karena tidak ada di up()
        });
    }
};