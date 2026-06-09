<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Concerns\HandlesImageUploads;
use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    use HandlesImageUploads;

    /** Post-purchase review (one per completed order). */
    public function store(Request $request)
    {
        $data = $request->validate([
            'order_id' => ['required', 'exists:orders,id'],
            'rating' => ['required', 'integer', 'between:1,5'],
            'body' => ['nullable', 'string', 'max:2000'],
            'images' => ['nullable', 'array', 'max:4'],
            'images.*' => ['image', 'max:5120'],
        ]);

        $order = $request->user()->orders()->with('vendor')->findOrFail($data['order_id']);

        if ($order->status !== 'completed') {
            throw ValidationException::withMessages(['order_id' => 'You can only review completed orders.']);
        }
        if (Review::where('order_id', $order->id)->exists()) {
            throw ValidationException::withMessages(['order_id' => 'You have already reviewed this order.']);
        }

        $images = $request->hasFile('images')
            ? $this->storeImages($request->file('images'), 'reviews/'.$order->id)
            : [];

        $review = DB::transaction(function () use ($order, $data, $images) {
            $review = Review::create([
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'vendor_id' => $order->vendor_id,
                'rating' => $data['rating'],
                'body' => $data['body'] ?? null,
                'images' => $images,
            ]);

            $order->vendor->recalculateRating();

            return $review;
        });

        return response()->json(['data' => $review], 201);
    }
}
