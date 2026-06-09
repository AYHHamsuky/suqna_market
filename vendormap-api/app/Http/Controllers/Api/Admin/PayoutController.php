<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\VendorPayout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PayoutController extends Controller
{
    public function index(Request $request)
    {
        $query = VendorPayout::query()
            ->with('vendor:id,business_name,slug')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->latest();

        return response()->json($query->paginate(min((int) $request->input('per_page', 20), 50)));
    }

    public function pending()
    {
        $payouts = VendorPayout::whereIn('status', ['pending', 'processing'])
            ->with('vendor:id,business_name,slug')
            ->latest()
            ->paginate(20);

        return response()->json($payouts);
    }

    /** Mark a payout as processed (in production this would call Paystack Transfer API). */
    public function process(Request $request, int $id)
    {
        $payout = VendorPayout::findOrFail($id);

        $data = $request->validate([
            'status' => ['required', Rule::in(['paid', 'failed'])],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($payout, $data) {
            $payout->update([
                'status' => $data['status'],
                'notes' => $data['notes'] ?? $payout->notes,
                'gateway_ref' => $payout->gateway_ref ?? 'TRF-'.strtoupper(Str::random(10)),
                'processed_at' => now(),
            ]);

            // Refund the wallet if the transfer failed.
            if ($data['status'] === 'failed') {
                $payout->vendor()->increment('wallet_balance', $payout->amount);
            }
        });

        return response()->json(['data' => $payout->fresh('vendor')]);
    }
}
