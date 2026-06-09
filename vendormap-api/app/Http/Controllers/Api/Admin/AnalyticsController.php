<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\Order;
use App\Models\User;
use App\Models\VendorPayout;
use App\Models\VendorProfile;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function overview(Request $request)
    {
        $paidStatuses = ['confirmed', 'preparing', 'ready', 'dispatched', 'completed'];

        $gmv = Order::whereIn('status', $paidStatuses)->sum('subtotal');
        $revenue = Order::whereIn('status', $paidStatuses)->sum('commission_amt');

        $series = Order::whereIn('status', $paidStatuses)
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->selectRaw('DATE(created_at) d, SUM(subtotal) gmv, SUM(commission_amt) revenue, COUNT(*) orders')
            ->groupBy('d')->orderBy('d')->get();

        return response()->json([
            'data' => [
                'gmv' => (float) $gmv,
                'platform_revenue' => (float) $revenue,
                'total_orders' => Order::count(),
                'completed_orders' => Order::where('status', 'completed')->count(),
                'active_vendors' => VendorProfile::where('is_approved', true)->count(),
                'pending_vendors' => VendorProfile::where('is_approved', false)->count(),
                'total_customers' => User::where('role', 'customer')->count(),
                'total_listings' => Listing::count(),
                'pending_payouts' => VendorPayout::whereIn('status', ['pending', 'processing'])->sum('amount'),
                'series' => $series,
                'top_vendors' => Order::whereIn('orders.status', $paidStatuses)
                    ->join('vendor_profiles as vp', 'vp.id', '=', 'orders.vendor_id')
                    ->selectRaw('vp.business_name, vp.slug, SUM(orders.subtotal) gmv, COUNT(*) orders')
                    ->groupBy('vp.id', 'vp.business_name', 'vp.slug')
                    ->orderByDesc('gmv')->limit(5)->get(),
                'top_categories' => Listing::join('categories as c', 'c.id', '=', 'listings.category_id')
                    ->selectRaw('c.name, COUNT(*) listings')
                    ->groupBy('c.id', 'c.name')
                    ->orderByDesc('listings')->limit(6)->get(),
            ],
        ]);
    }
}
