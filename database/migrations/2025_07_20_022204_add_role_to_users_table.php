<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Tambahkan kolom foreign key 'role_id'
            $table->foreignId('role_id')
                  ->nullable() // Izinkan null, misalnya saat pengguna mendaftar belum memiliki peran
                  ->constrained('roles') // Mengacu pada kolom 'id' di tabel 'roles'
                  ->onDelete('set null'); // Jika role dihapus, set 'role_id' di user jadi NULL
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']); // Hapus foreign key terlebih dahulu
            $table->dropColumn('role_id');    // Kemudian hapus kolom
        });
    }
};