<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorPayout extends Model
{
    protected $fillable = [
        'vendor_id', 'amount', 'bank_name', 'account_number', 'account_name',
        'gateway', 'gateway_ref', 'status', 'processed_at', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'processed_at' => 'datetime',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(VendorProfile::class, 'vendor_id');
    }
}
