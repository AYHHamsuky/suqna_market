<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $items = $request->user()->wishlist()
            ->with(['listing.vendor:id,business_name,slug', 'listing.category:id,name,slug,icon'])
            ->latest()
            ->get()
            ->pluck('listing')
            ->filter()
            ->values();

        return response()->json(['data' => $items]);
    }

    public function store(Request $request, int $listingId)
    {
        $wishlist = Wishlist::firstOrCreate([
            'user_id' => $request->user()->id,
            'listing_id' => $listingId,
        ]);

        return response()->json(['data' => $wishlist], 201);
    }

    public function destroy(Request $request, int $listingId)
    {
        $request->user()->wishlist()->where('listing_id', $listingId)->delete();
        return response()->json(['message' => 'Removed from wishlist.']);
    }
}
