<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Concerns\HandlesImageUploads;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    use HandlesImageUploads;

    public function show(Request $request)
    {
        $vendor = $request->user()->vendorProfile()->with('category:id,name,slug,icon')->firstOrFail();
        return response()->json(['data' => $vendor]);
    }

    public function update(Request $request)
    {
        $vendor = $request->user()->vendorProfile()->firstOrFail();

        $data = $request->validate([
            'business_name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category_id' => ['sometimes', 'exists:categories,id'],
            'address' => ['sometimes', 'string'],
            'city' => ['sometimes', 'string', 'max:100'],
            'state' => ['sometimes', 'string', 'max:100'],
            'latitude' => ['sometimes', 'numeric', 'between:3.0,14.5'],
            'longitude' => ['sometimes', 'numeric', 'between:2.0,15.5'],
            'operating_hours' => ['nullable', 'array'],
            'phone' => ['nullable', 'string', 'max:20'],
            'is_open' => ['sometimes', 'boolean'],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'account_number' => ['nullable', 'string', 'max:20'],
            'account_name' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'max:4096'],
            'banner' => ['nullable', 'image', 'max:6144'],
        ]);

        if ($request->hasFile('logo')) {
            $data['logo'] = $this->storeImage($request->file('logo'), 'vendors/logos');
        }
        if ($request->hasFile('banner')) {
            $data['banner'] = $this->storeImage($request->file('banner'), 'vendors/banners');
        }

        $vendor->update($data);

        return response()->json(['data' => $vendor->fresh('category')]);
    }
}
