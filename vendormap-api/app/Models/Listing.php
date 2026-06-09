<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Listing extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vendor_id', 'category_id', 'name', 'slug', 'description',
        'pricing_mode', 'price', 'price_min', 'price_max', 'price_unit',
        'currency', 'is_available', 'is_featured', 'tags', 'images',
    ];

    protected $appends = ['price_label', 'effective_price'];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'images' => 'array',
            'is_available' => 'boolean',
            'is_featured' => 'boolean',
            'price' => 'float',
            'price_min' => 'float',
            'price_max' => 'float',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Listing $listing) {
            if (empty($listing->slug) && $listing->name) {
                $listing->slug = Str::slug($listing->name).'-'.Str::lower(Str::random(5));
            }
        });
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(VendorProfile::class, 'vendor_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** Human-friendly price label honouring the pricing mode. */
    public function getPriceLabelAttribute(): string
    {
        $fmt = fn ($n) => '₦'.number_format((float) $n);
        return match ($this->pricing_mode) {
            'fixed' => $fmt($this->price).($this->price_unit ? ' / '.$this->price_unit : ''),
            'range' => $fmt($this->price_min).' – '.$fmt($this->price_max).($this->price_unit ? ' / '.$this->price_unit : ''),
            'per_unit' => $fmt($this->price).' / '.($this->price_unit ?: 'unit'),
            'ask' => 'Ask vendor',
            default => $fmt($this->price),
        };
    }

    /** Representative price used for sorting/comparison. */
    public function getEffectivePriceAttribute(): ?float
    {
        return match ($this->pricing_mode) {
            'fixed', 'per_unit' => $this->price,
            'range' => $this->price_min,
            default => null,
        };
    }
}
