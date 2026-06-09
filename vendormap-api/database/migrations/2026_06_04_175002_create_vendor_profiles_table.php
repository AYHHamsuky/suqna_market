<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('business_name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->text('address');
            $table->string('city', 100)->default('Kaduna');
            $table->string('state', 100)->default('Kaduna');
            // POINT geometry, SRID 4326 (WGS84), stored as POINT(lng, lat)
            $table->geometry('coordinates', subtype: 'point', srid: 4326);
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->json('operating_hours')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('logo')->nullable();
            $table->string('banner')->nullable();
            $table->boolean('is_approved')->default(false);
            $table->boolean('is_open')->default(true);
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->integer('rating_count')->default(0);
            $table->decimal('wallet_balance', 14, 2)->default(0);
            // bank details for payouts
            $table->string('bank_name', 100)->nullable();
            $table->string('account_number', 20)->nullable();
            $table->string('account_name')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['city', 'state']);
        });

        // Spatial index requires NOT NULL geometry column (already enforced) on InnoDB.
        DB::statement('ALTER TABLE vendor_profiles ADD SPATIAL INDEX vendor_coordinates_spatial (coordinates)');
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_profiles');
    }
};
