<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Payment processing via Paystack, with a mock mode for local development.
 *
 * Real mode hits the Paystack API; mock mode returns a frontend checkout URL
 * and lets the /payments/verify endpoint complete the flow.
 */
class PaymentService
{
    public function isMock(): bool
    {
        return (bool) config('vendormap.payments_mock');
    }

    /**
     * Initialise a transaction for an order.
     *
     * @return array{authorization_url: string, reference: string, access_code: ?string}
     */
    public function initialize(Order $order, string $email): array
    {
        $reference = 'VMPAY-'.strtoupper(Str::random(12));
        $amountKobo = (int) round($order->subtotal * 100);

        $payment = Payment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'gateway' => 'paystack',
                'gateway_ref' => $reference,
                'amount' => $order->subtotal,
                'currency' => 'NGN',
                'status' => 'pending',
            ]
        );

        if ($this->isMock()) {
            // Point to the frontend mock checkout page.
            $url = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5174')), '/')
                .'/checkout/mock?reference='.$reference.'&order='.$order->reference;

            return ['authorization_url' => $url, 'reference' => $reference, 'access_code' => null];
        }

        $res = Http::withToken(config('services.paystack.secret_key'))
            ->post(config('services.paystack.base_url').'/transaction/initialize', [
                'email' => $email,
                'amount' => $amountKobo,
                'reference' => $reference,
                'callback_url' => rtrim(config('app.frontend_url'), '/').'/checkout/callback',
                'metadata' => ['order_id' => $order->id, 'order_reference' => $order->reference],
            ])->throw()->json();

        return [
            'authorization_url' => $res['data']['authorization_url'],
            'reference' => $reference,
            'access_code' => $res['data']['access_code'] ?? null,
        ];
    }

    /**
     * Verify a transaction by reference and finalise on success.
     */
    public function verify(string $reference): Payment
    {
        $payment = Payment::where('gateway_ref', $reference)->firstOrFail();

        if ($payment->status === 'success') {
            return $payment;
        }

        if ($this->isMock()) {
            return $this->markSuccessful($payment, ['mock' => true, 'verified_at' => now()->toIso8601String()]);
        }

        $res = Http::withToken(config('services.paystack.secret_key'))
            ->get(config('services.paystack.base_url').'/transaction/verify/'.$reference)
            ->throw()->json();

        if (($res['data']['status'] ?? null) === 'success') {
            return $this->markSuccessful($payment, $res['data']);
        }

        $payment->update(['status' => 'failed', 'meta' => $res['data'] ?? null]);
        return $payment;
    }

    /**
     * Finalise a successful payment: confirm order, credit vendor wallet, snapshot ledger.
     */
    public function markSuccessful(Payment $payment, array $meta = []): Payment
    {
        return DB::transaction(function () use ($payment, $meta) {
            $payment->forceFill([
                'status' => 'success',
                'paid_at' => now(),
                'meta' => $meta,
            ])->save();

            $order = $payment->order()->lockForUpdate()->first();
            if ($order && $order->status === 'pending') {
                $order->update(['status' => 'confirmed']);

                // Credit the vendor wallet with the net payout.
                $vendor = $order->vendor()->lockForUpdate()->first();
                $vendor->increment('wallet_balance', $order->vendor_payout);
            }

            return $payment;
        });
    }
}
