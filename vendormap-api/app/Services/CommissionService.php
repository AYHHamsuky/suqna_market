<?php

namespace App\Services;

use App\Models\VendorProfile;

class CommissionService
{
    /**
     * Resolve the applicable commission rate (%) for a vendor.
     *
     * Resolution order: vendor-specific → category-level → platform default.
     * (Vendor/category overrides are stubbed here; extend as the admin panel grows.)
     */
    public function rateFor(VendorProfile $vendor): float
    {
        // Future: $vendor->commission_rate ?? $vendor->category->commission_rate ?? default
        return (float) config('vendormap.default_commission_rate');
    }

    /**
     * @return array{rate: float, commission: float, payout: float}
     */
    public function calculate(float $subtotal, float $rate): array
    {
        $commission = round($subtotal * ($rate / 100), 2);
        return [
            'rate' => $rate,
            'commission' => $commission,
            'payout' => round($subtotal - $commission, 2),
        ];
    }
}
