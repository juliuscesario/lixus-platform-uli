<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'domain',
        'data',
    ];

    protected $casts = [
        'data' => 'json',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}