<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VendorProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'business_name', 'slug', 'description', 'category_id',
        'address', 'city', 'state', 'latitude', 'longitude', 'operating_hours',
        'phone', 'logo', 'banner', 'is_approved', 'is_open',
        'bank_name', 'account_number', 'account_name',
    ];

    protected $hidden = ['coordinates'];

    protected function casts(): array
    {
        return [
            'operating_hours' => 'array',
            'is_approved' => 'boolean',
            'is_open' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
            'rating_avg' => 'float',
            'wallet_balance' => 'float',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (VendorProfile $vendor) {
            if (empty($vendor->slug) && $vendor->business_name) {
                $vendor->slug = static::uniqueSlug($vendor->business_name);
            }
            // Keep the POINT geometry in sync with lat/lng (stored as POINT(lng, lat), SRID 4326).
            if (! is_null($vendor->latitude) && ! is_null($vendor->longitude)) {
                $vendor->coordinates = DB::raw(
                    sprintf("ST_SRID(POINT(%F, %F), 4326)", (float) $vendor->longitude, (float) $vendor->latitude)
                );
            }
        });
    }

    public static function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;
        while (static::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$i);
        }
        return $slug;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class, 'vendor_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'vendor_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'vendor_id');
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(VendorPayout::class, 'vendor_id');
    }

    public function recalculateRating(): void
    {
        $agg = $this->reviews()->selectRaw('COUNT(*) c, COALESCE(AVG(rating),0) a')->first();
        $this->forceFill([
            'rating_count' => (int) $agg->c,
            'rating_avg' => round((float) $agg->a, 2),
        ])->saveQuietly();
    }
}
