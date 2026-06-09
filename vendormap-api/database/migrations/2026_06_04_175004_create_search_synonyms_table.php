<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('search_synonyms', function (Blueprint $table) {
            $table->id();
            $table->string('search_term');   // what the customer types
            $table->string('canonical_tag'); // the tag to search for
            $table->string('language', 20)->default('any');
            $table->timestamps();

            $table->index('search_term');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_synonyms');
    }
};
