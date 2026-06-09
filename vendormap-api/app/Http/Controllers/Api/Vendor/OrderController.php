<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /** Allowed forward transitions for a vendor. */
    protected array $flow = [
        'pending' => ['cancelled'],
        'confirmed' => ['preparing', 'cancelled'],
        'preparing' => ['ready', 'dispatched'],
        'ready' => ['completed'],
        'dispatched' => ['completed'],
    ];

    public function index(Request $request)
    {
        $vendor = $request->user()->vendorProfile()->firstOrFail();

        $orders = $vendor->orders()
            ->with(['items', 'customer:id,name,phone,avatar', 'payment'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->latest()
            ->paginate(min((int) $request->input('per_page', 20), 50));

        return response()->json($orders);
    }

    public function updateStatus(Request $request, int $id)
    {
        $vendor = $request->user()->vendorProfile()->firstOrFail();
        $order = $vendor->orders()->findOrFail($id);

        $data = $request->validate([
            'status' => ['required', Rule::in(['confirmed', 'preparing', 'ready', 'dispatched', 'completed', 'cancelled'])],
        ]);

        $allowed = $this->flow[$order->status] ?? [];
        abort_unless(in_array($data['status'], $allowed, true), 422, "Cannot move order from {$order->status} to {$data['status']}.");

        DB::transaction(function () use ($order, $data) {
            $order->status = $data['status'];
            if ($data['status'] === 'completed') {
                $order->completed_at = now();
            }
            $order->save();
        });

        return response()->json(['data' => $order->fresh(['items', 'customer'])]);
    }
}
