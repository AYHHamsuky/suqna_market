<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('vendor_profiles')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('name');            // vendor's own item name, any language
            $table->string('slug');
            $table->text('description')->nullable();
            $table->enum('pricing_mode', ['fixed', 'range', 'per_unit', 'ask'])->default('fixed');
            $table->decimal('price', 12, 2)->nullable();
            $table->decimal('price_min', 12, 2)->nullable();
            $table->decimal('price_max', 12, 2)->nullable();
            $table->string('price_unit', 50)->nullable();
            $table->string('currency', 10)->default('NGN');
            $table->boolean('is_available')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->json('tags')->nullable();
            $table->json('images')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('vendor_id');
            $table->index('category_id');
        });

        // FULLTEXT index for intelligent search (InnoDB, MySQL 5.6+)
        Schema::table('listings', function (Blueprint $table) {
            $table->fullText(['name', 'description']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
