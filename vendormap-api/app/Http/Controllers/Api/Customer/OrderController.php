<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\Order;
use App\Services\CommissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function __construct(private CommissionService $commission) {}

    public function index(Request $request)
    {
        $orders = $request->user()->orders()
            ->with(['vendor:id,business_name,slug,logo', 'items', 'payment', 'review'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->latest()
            ->paginate(min((int) $request->input('per_page', 15), 50));

        return response()->json($orders);
    }

    public function show(Request $request, int $id)
    {
        $order = $request->user()->orders()
            ->with(['vendor:id,business_name,slug,logo,phone,address,latitude,longitude', 'items.listing:id,slug,images', 'payment', 'review'])
            ->findOrFail($id);

        return response()->json(['data' => $order]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.listing_id' => ['required', 'exists:listings,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.001'],
            'delivery_type' => ['nullable', Rule::in(['pickup', 'delivery'])],
            'delivery_address' => ['nullable', 'string', 'required_if:delivery_type,delivery'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $listings = Listing::whereIn('id', collect($data['items'])->pluck('listing_id'))
            ->with('vendor:id,is_approved')
            ->get()->keyBy('id');

        // Single-vendor order enforcement.
        $vendorIds = $listings->pluck('vendor_id')->unique();
        if ($vendorIds->count() !== 1) {
            throw ValidationException::withMessages(['items' => 'All items in an order must be from the same vendor.']);
        }
        $vendorId = $vendorIds->first();
        $vendor = $listings->first()->vendor;
        abort_unless($vendor && $vendor->is_approved, 422, 'Vendor is not available.');

        $order = DB::transaction(function () use ($data, $listings, $vendorId, $request) {
            $subtotal = 0;
            $itemsPayload = [];

            foreach ($data['items'] as $row) {
                $listing = $listings[$row['listing_id']];
                if ($listing->pricing_mode === 'ask') {
                    throw ValidationException::withMessages(['items' => "\"{$listing->name}\" is negotiable — please chat with the vendor instead of ordering directly."]);
                }
                if (! $listing->is_available) {
                    throw ValidationException::withMessages(['items' => "\"{$listing->name}\" is no longer available."]);
                }

                $unitPrice = $listing->effective_price ?? 0;
                $lineTotal = round($unitPrice * $row['quantity'], 2);
                $subtotal += $lineTotal;

                $itemsPayload[] = [
                    'listing_id' => $listing->id,
                    'listing_name' => $listing->name,
                    'quantity' => $row['quantity'],
                    'unit' => $listing->price_unit,
                    'unit_price' => $unitPrice,
                    'subtotal' => $lineTotal,
                ];
            }

            $rate = $this->commission->rateFor($listings->first()->vendor);
            $calc = $this->commission->calculate($subtotal, $rate);

            $order = Order::create([
                'reference' => 'SQ-'.now()->format('Ymd').'-'.strtoupper(Str::random(6)),
                'customer_id' => $request->user()->id,
                'vendor_id' => $vendorId,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'commission_rate' => $calc['rate'],
                'commission_amt' => $calc['commission'],
                'vendor_payout' => $calc['payout'],
                'notes' => $data['notes'] ?? null,
                'delivery_type' => $data['delivery_type'] ?? 'pickup',
                'delivery_address' => $data['delivery_address'] ?? null,
            ]);

            $order->items()->createMany($itemsPayload);

            return $order;
        });

        return response()->json(['data' => $order->load(['items', 'vendor:id,business_name,slug'])], 201);
    }
}
