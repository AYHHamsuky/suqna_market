<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Concerns\HandlesImageUploads;
use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ListingController extends Controller
{
    use HandlesImageUploads;

    public function index(Request $request)
    {
        $vendor = $request->user()->vendorProfile()->firstOrFail();
        $listings = $vendor->listings()
            ->with('category:id,name,slug,icon')
            ->latest()
            ->paginate(min((int) $request->input('per_page', 20), 50));

        return response()->json($listings);
    }

    public function store(Request $request)
    {
        $vendor = $request->user()->vendorProfile()->firstOrFail();
        $data = $this->validateListing($request);

        $images = [];
        if ($request->hasFile('images')) {
            $images = $this->storeImages($request->file('images'), 'listings/'.$vendor->id);
        }

        $listing = $vendor->listings()->create(array_merge(
            $this->priceFields($data),
            [
                'category_id' => $data['category_id'],
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'pricing_mode' => $data['pricing_mode'],
                'price_unit' => $data['price_unit'] ?? null,
                'is_available' => $data['is_available'] ?? true,
                'is_featured' => $data['is_featured'] ?? false,
                'tags' => $this->parseTags($data['tags'] ?? null),
                'images' => $images,
            ]
        ));

        return response()->json(['data' => $listing->load('category')], 201);
    }

    public function update(Request $request, int $id)
    {
        $vendor = $request->user()->vendorProfile()->firstOrFail();
        $listing = $vendor->listings()->findOrFail($id);
        $data = $this->validateListing($request, updating: true);

        // Existing images to keep (URLs) + newly uploaded files.
        $images = $listing->images ?? [];
        if ($request->has('existing_images')) {
            $existing = $request->input('existing_images');
            $images = is_array($existing) ? $existing : (json_decode($existing, true) ?: []);
        }
        if ($request->hasFile('images')) {
            $images = array_merge($images, $this->storeImages($request->file('images'), 'listings/'.$vendor->id));
        }

        $payload = $this->priceFields($data);
        foreach (['category_id', 'name', 'description', 'pricing_mode', 'price_unit', 'is_available', 'is_featured'] as $f) {
            if (array_key_exists($f, $data)) {
                $payload[$f] = $data[$f];
            }
        }
        if (array_key_exists('tags', $data)) {
            $payload['tags'] = $this->parseTags($data['tags']);
        }
        $payload['images'] = $images;

        $listing->update($payload);

        return response()->json(['data' => $listing->fresh('category')]);
    }

    public function destroy(Request $request, int $id)
    {
        $vendor = $request->user()->vendorProfile()->firstOrFail();
        $listing = $vendor->listings()->findOrFail($id);
        $listing->delete();

        return response()->json(['message' => 'Listing deleted.']);
    }

    protected function validateListing(Request $request, bool $updating = false): array
    {
        $req = $updating ? 'sometimes' : 'required';

        $data = $request->validate([
            'category_id' => [$req, 'exists:categories,id'],
            'name' => [$req, 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'pricing_mode' => [$req, Rule::in(['fixed', 'range', 'per_unit', 'ask'])],
            'price' => ['nullable', 'numeric', 'min:0'],
            'price_min' => ['nullable', 'numeric', 'min:0'],
            'price_max' => ['nullable', 'numeric', 'min:0', 'gte:price_min'],
            'price_unit' => ['nullable', 'string', 'max:50'],
            'is_available' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'tags' => ['nullable'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:5120'],
        ]);

        // Mode-specific requirements.
        $mode = $data['pricing_mode'] ?? null;
        if ($mode === 'fixed' || $mode === 'per_unit') {
            $request->validate(['price' => ['required', 'numeric', 'min:0']]);
        } elseif ($mode === 'range') {
            $request->validate([
                'price_min' => ['required', 'numeric', 'min:0'],
                'price_max' => ['required', 'numeric', 'gte:price_min'],
            ]);
        }

        return $data;
    }

    protected function priceFields(array $data): array
    {
        return [
            'price' => $data['price'] ?? null,
            'price_min' => $data['price_min'] ?? null,
            'price_max' => $data['price_max'] ?? null,
        ];
    }

    protected function parseTags($tags): array
    {
        if (is_array($tags)) {
            return array_values(array_filter(array_map('trim', $tags)));
        }
        if (is_string($tags) && $tags !== '') {
            $decoded = json_decode($tags, true);
            if (is_array($decoded)) {
                return array_values(array_filter(array_map('trim', $decoded)));
            }
            return array_values(array_filter(array_map('trim', explode(',', $tags))));
        }
        return [];
    }
}
