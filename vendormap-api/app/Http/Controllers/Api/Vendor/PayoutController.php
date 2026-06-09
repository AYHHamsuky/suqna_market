<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\VendorPayout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PayoutController extends Controller
{
    public function index(Request $request)
    {
        $vendor = $request->user()->vendorProfile()->firstOrFail();
        return response()->json([
            'wallet_balance' => (float) $vendor->wallet_balance,
            'payouts' => $vendor->payouts()->latest()->paginate(15),
        ]);
    }

    public function request(Request $request)
    {
        $vendor = $request->user()->vendorProfile()->firstOrFail();

        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:100'],
            'bank_name' => ['required', 'string', 'max:100'],
            'account_number' => ['required', 'string', 'max:20'],
            'account_name' => ['required', 'string', 'max:255'],
        ]);

        $payout = DB::transaction(function () use ($vendor, $data) {
            $vendor = $vendor->newQuery()->lockForUpdate()->find($vendor->id);
            if ($data['amount'] > $vendor->wallet_balance) {
                throw ValidationException::withMessages(['amount' => 'Amount exceeds your wallet balance.']);
            }

            $vendor->decrement('wallet_balance', $data['amount']);

            // Persist bank details for convenience next time.
            $vendor->update([
                'bank_name' => $data['bank_name'],
                'account_number' => $data['account_number'],
                'account_name' => $data['account_name'],
            ]);

            return $vendor->payouts()->create([
                'amount' => $data['amount'],
                'bank_name' => $data['bank_name'],
                'account_number' => $data['account_number'],
                'account_name' => $data['account_name'],
                'gateway' => 'paystack',
                'status' => 'pending',
            ]);
        });

        return response()->json(['data' => $payout], 201);
    }
}
