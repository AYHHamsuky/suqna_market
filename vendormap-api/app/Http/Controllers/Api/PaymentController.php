<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private PaymentService $payments) {}

    /** Verify a transaction by reference (used by mock checkout and the gateway callback). */
    public function verify(Request $request)
    {
        $data = $request->validate(['reference' => ['required', 'string']]);

        $payment = $this->payments->verify($data['reference']);
        $payment->load('order:id,reference,status,subtotal');

        return response()->json([
            'data' => [
                'status' => $payment->status,
                'order' => $payment->order,
            ],
        ]);
    }

    /** Paystack webhook (no auth — verified via signature). */
    public function paystackWebhook(Request $request)
    {
        $payload = $request->getContent();

        if (! $this->payments->isMock()) {
            $signature = $request->header('x-paystack-signature');
            $expected = hash_hmac('sha512', $payload, config('services.paystack.secret_key'));
            abort_unless(hash_equals($expected, (string) $signature), 401, 'Invalid signature.');
        }

        $event = json_decode($payload, true);
        if (($event['event'] ?? null) === 'charge.success') {
            $reference = $event['data']['reference'] ?? null;
            if ($reference && ($payment = Payment::where('gateway_ref', $reference)->first())) {
                $this->payments->markSuccessful($payment, $event['data']);
            }
        }

        return response()->json(['received' => true]);
    }

    /** Flutterwave webhook (no auth — verified via secret hash). */
    public function flutterwaveWebhook(Request $request)
    {
        // Placeholder: verify 'verif-hash' header against configured secret in production.
        return response()->json(['received' => true]);
    }
}
