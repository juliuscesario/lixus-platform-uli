<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany; // Import untuk relasi
use Illuminate\Database\Eloquent\Concerns\HasUuids; // Import HasUuids

class Role extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['name']; // Kolom yang bisa diisi secara massal

    /**
     * Get the users for the role.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}