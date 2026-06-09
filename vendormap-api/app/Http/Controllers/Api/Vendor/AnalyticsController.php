<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $vendor = $request->user()->vendorProfile()->firstOrFail();

        $orders = $vendor->orders();
        $completed = (clone $orders)->where('status', 'completed');

        $revenue = (clone $orders)
            ->whereIn('status', ['confirmed', 'preparing', 'ready', 'dispatched', 'completed'])
            ->sum('vendor_payout');

        // Last 14 days revenue series.
        $series = (clone $orders)
            ->whereIn('status', ['confirmed', 'preparing', 'ready', 'dispatched', 'completed'])
            ->where('created_at', '>=', now()->subDays(13)->startOfDay())
            ->selectRaw('DATE(created_at) as d, SUM(vendor_payout) as total, COUNT(*) as count')
            ->groupBy('d')->orderBy('d')->get();

        return response()->json([
            'data' => [
                'wallet_balance' => (float) $vendor->wallet_balance,
                'net_revenue' => (float) $revenue,
                'total_orders' => (clone $orders)->count(),
                'completed_orders' => $completed->count(),
                'pending_orders' => (clone $orders)->whereIn('status', ['pending', 'confirmed', 'preparing'])->count(),
                'active_listings' => $vendor->listings()->where('is_available', true)->count(),
                'rating_avg' => (float) $vendor->rating_avg,
                'rating_count' => (int) $vendor->rating_count,
                'revenue_series' => $series,
                'top_listings' => $vendor->orders()
                    ->join('order_items', 'orders.id', '=', 'order_items.order_id')
                    ->selectRaw('order_items.listing_name, SUM(order_items.quantity) qty, SUM(order_items.subtotal) total')
                    ->groupBy('order_items.listing_name')
                    ->orderByDesc('total')
                    ->limit(5)->get(),
            ],
        ]);
    }
}
