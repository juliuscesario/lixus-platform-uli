<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids; // Pastikan ini ada jika Anda pakai UUID

class Post extends Model
{
    use HasFactory, HasUuids; // Tambahkan HasUuids jika menggunakan UUID untuk ID

    // Pastikan fillable atau guarded sudah diatur
    protected $fillable = [
        'campaign_id',
        'user_id',
        'social_media_account_id',
        'platform',
        'platform_post_id',
        'post_type',
        'post_url',
        'caption',
        'raw_data',
        'metrics', // Tambahkan ini
        'score', // Tambahkan ini
        'posted_at',
        'is_valid_for_campaign', // Nama kolom validasi yang baru
        'validation_notes', // Nama kolom validasi yang baru
    ];

    // Tambahkan casting untuk kolom JSON dan timestamp
    protected $casts = [
        'raw_data' => 'array', // Jika raw_data juga JSON
        'metrics' => 'array',  // <-- INI YANG PENTING
        'posted_at' => 'datetime',
        'is_valid_for_campaign' => 'boolean', // Casting untuk boolean
        // 'score' => 'float', // Laravel akan otomatis meng-cast decimal ke float/string, bisa opsional
    ];

    // Relasi
    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function socialMediaAccount()
    {
        return $this->belongsTo(SocialMediaAccount::class);
    }

    public function scores()
    {
        return $this->hasMany(Score::class); // Jika Anda memiliki model Score terpisah
    }
}