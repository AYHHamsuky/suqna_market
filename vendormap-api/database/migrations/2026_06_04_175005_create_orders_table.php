<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 50)->unique();   // VM-20240601-00345
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('vendor_profiles')->cascadeOnDelete();
            $table->enum('status', [
                'pending', 'confirmed', 'preparing', 'ready',
                'dispatched', 'completed', 'cancelled', 'disputed',
            ])->default('pending');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('commission_rate', 5, 2);     // snapshot at order time
            $table->decimal('commission_amt', 12, 2);
            $table->decimal('vendor_payout', 12, 2);      // subtotal - commission_amt
            $table->text('notes')->nullable();
            $table->enum('delivery_type', ['pickup', 'delivery'])->default('pickup');
            $table->text('delivery_address')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['vendor_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
