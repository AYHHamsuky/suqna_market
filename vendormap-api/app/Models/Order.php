<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'reference', 'customer_id', 'vendor_id', 'status', 'subtotal',
        'commission_rate', 'commission_amt', 'vendor_payout', 'notes',
        'delivery_type', 'delivery_address', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'float',
            'commission_rate' => 'float',
            'commission_amt' => 'float',
            'vendor_payout' => 'float',
            'completed_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(VendorProfile::class, 'vendor_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function isPaid(): bool
    {
        return $this->payment && $this->payment->status === 'success';
    }
}
