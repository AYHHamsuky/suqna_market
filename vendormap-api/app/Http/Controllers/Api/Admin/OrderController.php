<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::query()
            ->with(['customer:id,name', 'vendor:id,business_name,slug', 'payment'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->filled('q'), fn ($q) => $q->where('reference', 'like', '%'.$request->input('q').'%'))
            ->latest();

        return response()->json($query->paginate(min((int) $request->input('per_page', 25), 50)));
    }
}
