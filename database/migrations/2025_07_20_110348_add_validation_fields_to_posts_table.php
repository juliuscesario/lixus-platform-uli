<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            if (!Schema::hasColumn('posts', 'is_valid_for_campaign')) {
                $table->boolean('is_valid_for_campaign')->default(false)->after('score');
            }
            if (!Schema::hasColumn('posts', 'validation_notes')) {
                $table->text('validation_notes')->nullable()->after('is_valid_for_campaign');
            }
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['is_valid_for_campaign', 'validation_notes']);
        });
    }
};