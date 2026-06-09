<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VendorProfile;
use App\Services\SearchService;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    public function __construct(private SearchService $search) {}

    /** Paginated, filterable public vendor directory. */
    public function index(Request $request)
    {
        $query = VendorProfile::query()
            ->where('is_approved', true)
            ->with(['category:id,name,slug,icon'])
            ->withCount(['listings' => fn ($l) => $l->where('is_available', true)]);

        if ($request->filled('q')) {
            $q = $this->search->normalise($request->input('q'));
            $query->where('business_name', 'like', "%{$q}%");
        }
        if ($request->filled('category')) {
            $cat = $request->input('category');
            is_numeric($cat)
                ? $query->where('category_id', (int) $cat)
                : $query->whereHas('category', fn ($c) => $c->where('slug', $cat));
        }
        if ($request->filled('city')) {
            $query->where('city', $request->input('city'));
        }

        $query->orderByDesc('rating_avg')->orderByDesc('rating_count');

        return response()->json($query->paginate(min((int) $request->input('per_page', 20), 50)));
    }

    public function show(string $slug)
    {
        $vendor = VendorProfile::where('slug', $slug)
            ->where('is_approved', true)
            ->with('category:id,name,slug,icon')
            ->withCount(['listings' => fn ($l) => $l->where('is_available', true), 'reviews'])
            ->firstOrFail();

        return response()->json(['data' => $vendor]);
    }

    public function listings(string $slug, Request $request)
    {
        $vendor = VendorProfile::where('slug', $slug)->where('is_approved', true)->firstOrFail();

        $listings = $vendor->listings()
            ->when($request->boolean('available_only', true), fn ($q) => $q->where('is_available', true))
            ->with('category:id,name,slug,icon')
            ->orderByDesc('is_featured')
            ->orderBy('name')
            ->paginate(min((int) $request->input('per_page', 24), 50));

        return response()->json($listings);
    }

    public function reviews(string $slug, Request $request)
    {
        $vendor = VendorProfile::where('slug', $slug)->where('is_approved', true)->firstOrFail();

        $reviews = $vendor->reviews()
            ->with('customer:id,name,avatar')
            ->latest()
            ->paginate(min((int) $request->input('per_page', 10), 30));

        return response()->json($reviews);
    }

    /** Vendors within a radius, for map pins. */
    public function map(Request $request)
    {
        $data = $request->validate([
            'lat' => ['required', 'numeric'],
            'lng' => ['required', 'numeric'],
            'radius_km' => ['nullable', 'numeric', 'min:0.5'],
            'q' => ['nullable', 'string'],
        ]);

        $vendors = $this->search->vendorsForMap(
            (float) $data['lat'],
            (float) $data['lng'],
            (float) ($data['radius_km'] ?? config('vendormap.default_radius_km')),
            $data['q'] ?? null,
        );

        return response()->json(['data' => $vendors]);
    }
}
