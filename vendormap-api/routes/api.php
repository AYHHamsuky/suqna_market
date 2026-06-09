<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Api\Customer;
use App\Http\Controllers\Api\Vendor;
use Illuminate\Support\Facades\Route;

// Health check
Route::get('/health', fn () => response()->json(['status' => 'ok', 'time' => now()->toIso8601String()]));

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register/customer', [AuthController::class, 'registerCustomer']);
    Route::post('/register/vendor', [AuthController::class, 'registerVendor']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/verify/phone', [AuthController::class, 'verifyPhone']);
    });
});

/*
|--------------------------------------------------------------------------
| Public discovery
|--------------------------------------------------------------------------
*/
Route::get('/categories', [CategoryController::class, 'index']);

Route::get('/listings', [ListingController::class, 'index']);
Route::get('/listings/suggest', [ListingController::class, 'suggest']);
Route::get('/listings/{id}', [ListingController::class, 'show'])->whereNumber('id');

Route::get('/vendors', [VendorController::class, 'index']);
Route::get('/vendors/map', [VendorController::class, 'map']);
Route::get('/vendors/{slug}', [VendorController::class, 'show']);
Route::get('/vendors/{slug}/listings', [VendorController::class, 'listings']);
Route::get('/vendors/{slug}/reviews', [VendorController::class, 'reviews']);

// Payment webhooks (no auth — signature verified)
Route::post('/payments/webhook/paystack', [PaymentController::class, 'paystackWebhook']);
Route::post('/payments/webhook/flutterwave', [PaymentController::class, 'flutterwaveWebhook']);

/*
|--------------------------------------------------------------------------
| Authenticated (any role)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Messaging (customers and vendors)
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{id}/messages', [ConversationController::class, 'messages']);
    Route::post('/conversations/{id}/messages', [ConversationController::class, 'sendMessage']);

    // Checkout & payment verification
    Route::post('/checkout/initiate', [CheckoutController::class, 'initiate']);
    Route::post('/payments/verify', [PaymentController::class, 'verify']);

    /*
    |----------------------------------------------------------------------
    | Customer
    |----------------------------------------------------------------------
    */
    Route::prefix('customer')->group(function () {
        Route::get('/orders', [Customer\OrderController::class, 'index']);
        Route::post('/orders', [Customer\OrderController::class, 'store']);
        Route::get('/orders/{id}', [Customer\OrderController::class, 'show'])->whereNumber('id');
        Route::post('/reviews', [Customer\ReviewController::class, 'store']);
        Route::get('/wishlist', [Customer\WishlistController::class, 'index']);
        Route::post('/wishlist/{listing_id}', [Customer\WishlistController::class, 'store'])->whereNumber('listing_id');
        Route::delete('/wishlist/{listing_id}', [Customer\WishlistController::class, 'destroy'])->whereNumber('listing_id');
    });

    /*
    |----------------------------------------------------------------------
    | Vendor dashboard
    |----------------------------------------------------------------------
    */
    Route::prefix('vendor')->middleware('role:vendor')->group(function () {
        Route::get('/profile', [Vendor\ProfileController::class, 'show']);
        Route::match(['put', 'post'], '/profile', [Vendor\ProfileController::class, 'update']);

        Route::get('/listings', [Vendor\ListingController::class, 'index']);
        Route::post('/listings', [Vendor\ListingController::class, 'store']);
        Route::match(['put', 'post'], '/listings/{id}', [Vendor\ListingController::class, 'update'])->whereNumber('id');
        Route::delete('/listings/{id}', [Vendor\ListingController::class, 'destroy'])->whereNumber('id');

        Route::get('/orders', [Vendor\OrderController::class, 'index']);
        Route::put('/orders/{id}/status', [Vendor\OrderController::class, 'updateStatus'])->whereNumber('id');

        Route::get('/reviews', [Vendor\ReviewController::class, 'index']);
        Route::post('/reviews/{id}/reply', [Vendor\ReviewController::class, 'reply'])->whereNumber('id');

        Route::get('/analytics', [Vendor\AnalyticsController::class, 'index']);
        Route::get('/payouts', [Vendor\PayoutController::class, 'index']);
        Route::post('/payouts/request', [Vendor\PayoutController::class, 'request']);
    });

    /*
    |----------------------------------------------------------------------
    | Admin
    |----------------------------------------------------------------------
    */
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/vendors', [Admin\VendorController::class, 'index']);
        Route::get('/vendors/pending', [Admin\VendorController::class, 'pending']);
        Route::put('/vendors/{id}/approve', [Admin\VendorController::class, 'approve'])->whereNumber('id');
        Route::put('/vendors/{id}/suspend', [Admin\VendorController::class, 'suspend'])->whereNumber('id');

        Route::get('/orders', [Admin\OrderController::class, 'index']);

        Route::get('/payouts', [Admin\PayoutController::class, 'index']);
        Route::get('/payouts/pending', [Admin\PayoutController::class, 'pending']);
        Route::put('/payouts/{id}/process', [Admin\PayoutController::class, 'process'])->whereNumber('id');

        Route::get('/analytics/overview', [Admin\AnalyticsController::class, 'overview']);

        Route::get('/synonyms', [Admin\SynonymController::class, 'index']);
        Route::post('/synonyms', [Admin\SynonymController::class, 'store']);
        Route::delete('/synonyms/{id}', [Admin\SynonymController::class, 'destroy'])->whereNumber('id');
    });
});
