<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaign_participants', function (Blueprint $table) {
            // Pastikan kolom participation_status ada sebelum di rename
            if (Schema::hasColumn('campaign_participants', 'participation_status')) {
                $table->renameColumn('participation_status', 'status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('campaign_participants', function (Blueprint $table) {
            // Kembalikan nama kolom jika di rollback
            if (Schema::hasColumn('campaign_participants', 'status')) {
                $table->renameColumn('status', 'participation_status');
            }
        });
    }
};