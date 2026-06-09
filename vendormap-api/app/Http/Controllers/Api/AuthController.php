<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function registerCustomer(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        if (empty($data['email']) && empty($data['phone'])) {
            throw ValidationException::withMessages(['email' => 'Provide an email or phone number.']);
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
            'role' => 'customer',
        ]);
        $user->assignRole('customer');

        return $this->tokenResponse($user, 201);
    }

    public function registerVendor(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:6'],
            'business_name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'description' => ['nullable', 'string'],
            'address' => ['required', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'latitude' => ['required', 'numeric', 'between:3.0,14.5'],
            'longitude' => ['required', 'numeric', 'between:2.0,15.5'],
            'operating_hours' => ['nullable', 'array'],
        ]);

        if (empty($data['email']) && empty($data['phone'])) {
            throw ValidationException::withMessages(['email' => 'Provide an email or phone number.']);
        }

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'],
                'role' => 'vendor',
            ]);
            $user->assignRole('vendor');

            VendorProfile::create([
                'user_id' => $user->id,
                'business_name' => $data['business_name'],
                'category_id' => $data['category_id'],
                'description' => $data['description'] ?? null,
                'address' => $data['address'],
                'city' => $data['city'] ?? 'Kaduna',
                'state' => $data['state'] ?? 'Kaduna',
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'operating_hours' => $data['operating_hours'] ?? null,
                'phone' => $data['phone'] ?? null,
                'is_approved' => false,
            ]);

            return $user;
        });

        return $this->tokenResponse($user->fresh('vendorProfile'), 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'login' => ['required', 'string'], // email or phone
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['login'])
            ->orWhere('phone', $data['login'])
            ->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['login' => 'Invalid credentials.']);
        }
        if (! $user->is_active) {
            throw ValidationException::withMessages(['login' => 'This account has been suspended.']);
        }

        return $this->tokenResponse($user);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('vendorProfile');
        return response()->json(['user' => $this->userPayload($user)]);
    }

    public function verifyPhone(Request $request)
    {
        // Stub: in production an OTP would be sent via Termii / Africa's Talking.
        $request->user()->forceFill(['phone_verified_at' => now()])->save();
        return response()->json(['message' => 'Phone verified.']);
    }

    protected function tokenResponse(User $user, int $status = 200)
    {
        $token = $user->createToken('vendormap')->plainTextToken;
        return response()->json([
            'token' => $token,
            'user' => $this->userPayload($user->load('vendorProfile')),
        ], $status);
    }

    protected function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'avatar' => $user->avatar,
            'phone_verified' => (bool) $user->phone_verified_at,
            'vendor_profile' => $user->vendorProfile,
        ];
    }
}
