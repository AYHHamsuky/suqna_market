<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function __construct(private PaymentService $payments) {}

    /** Initiate payment for a pending order; returns the gateway redirect URL. */
    public function initiate(Request $request)
    {
        $data = $request->validate([
            'order_id' => ['required', 'exists:orders,id'],
        ]);

        $order = $request->user()->orders()->findOrFail($data['order_id']);

        if ($order->status !== 'pending') {
            throw ValidationException::withMessages(['order_id' => 'This order can no longer be paid for.']);
        }

        $email = $request->user()->email ?? config('services.paystack.merchant_email');
        $init = $this->payments->initialize($order, $email);

        return response()->json([
            'data' => array_merge($init, [
                'order_reference' => $order->reference,
                'amount' => $order->subtotal,
                'mock' => $this->payments->isMock(),
            ]),
        ]);
    }
}
