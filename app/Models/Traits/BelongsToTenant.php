<?php

namespace App\Models\Traits;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant()
    {
        // Apply the global scope to filter by tenant
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (app()->has('tenant')) {
                $builder->where(self::getTable() . '.tenant_id', app('tenant')->id);
            }
        });

        // Automatically set the tenant_id when creating a new model
        static::creating(function (Model $model) {
            if (app()->has('tenant')) {
                $model->tenant_id = app('tenant')->id;
            }
        });
    }

    /**
     * Relationship to the Tenant model.
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}