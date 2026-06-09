<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Services\SearchService;
use Illuminate\Http\Request;

class ListingController extends Controller
{
    public function __construct(private SearchService $search) {}

    /**
     * Search & filter listings (price comparison list view feeds from here).
     * Query: q, category, lat, lng, radius_km, price_min, price_max, min_rating, sort, per_page
     */
    public function index(Request $request)
    {
        $params = $request->only([
            'q', 'category', 'lat', 'lng', 'radius_km',
            'price_min', 'price_max', 'min_rating', 'sort',
        ]);

        $perPage = min((int) $request->input('per_page', 20), 50);
        $results = $this->search->listingQuery($params)->paginate($perPage)->withQueryString();

        return response()->json($results);
    }

    public function show(int $id)
    {
        $listing = Listing::with([
            'vendor:id,business_name,slug,description,city,state,address,latitude,longitude,rating_avg,rating_count,is_open,is_approved,logo,banner,operating_hours,phone',
            'category:id,name,slug,icon',
        ])->findOrFail($id);

        abort_unless($listing->vendor && $listing->vendor->is_approved, 404);

        // A few more from the same vendor.
        $more = Listing::where('vendor_id', $listing->vendor_id)
            ->where('id', '!=', $listing->id)
            ->where('is_available', true)
            ->limit(6)->get();

        return response()->json(['data' => $listing, 'more_from_vendor' => $more]);
    }

    /** Autocomplete suggestions. */
    public function suggest(Request $request)
    {
        $suggestions = $this->search->suggest((string) $request->input('q', ''));
        return response()->json(['data' => $suggestions]);
    }
}
