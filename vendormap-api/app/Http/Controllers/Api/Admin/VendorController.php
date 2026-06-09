<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\VendorProfile;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    public function index(Request $request)
    {
        $query = VendorProfile::query()
            ->with(['user:id,name,email,phone,is_active', 'category:id,name,slug'])
            ->withCount('listings');

        if ($request->filled('status')) {
            match ($request->input('status')) {
                'pending' => $query->where('is_approved', false),
                'approved' => $query->where('is_approved', true),
                default => null,
            };
        }
        if ($request->filled('q')) {
            $query->where('business_name', 'like', '%'.$request->input('q').'%');
        }

        return response()->json($query->latest()->paginate(min((int) $request->input('per_page', 20), 50)));
    }

    public function pending(Request $request)
    {
        $vendors = VendorProfile::where('is_approved', false)
            ->with(['user:id,name,email,phone', 'category:id,name,slug'])
            ->latest()
            ->paginate(20);

        return response()->json($vendors);
    }

    public function approve(int $id)
    {
        $vendor = VendorProfile::findOrFail($id);
        $vendor->update(['is_approved' => true]);
        return response()->json(['data' => $vendor, 'message' => 'Vendor approved.']);
    }

    public function suspend(Request $request, int $id)
    {
        $vendor = VendorProfile::with('user')->findOrFail($id);
        $vendor->update(['is_approved' => false]);
        $vendor->user?->update(['is_active' => $request->boolean('deactivate_user', false) ? false : $vendor->user->is_active]);

        return response()->json(['data' => $vendor, 'message' => 'Vendor suspended.']);
    }
}
