<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $vendor = $request->user()->vendorProfile()->firstOrFail();
        $reviews = $vendor->reviews()->with('customer:id,name,avatar')->latest()->paginate(15);
        return response()->json($reviews);
    }

    public function reply(Request $request, int $id)
    {
        $vendor = $request->user()->vendorProfile()->firstOrFail();
        $review = $vendor->reviews()->findOrFail($id);

        $data = $request->validate(['vendor_reply' => ['required', 'string', 'max:1000']]);

        $review->update([
            'vendor_reply' => $data['vendor_reply'],
            'vendor_replied_at' => now(),
        ]);

        return response()->json(['data' => $review->fresh('customer')]);
    }
}
