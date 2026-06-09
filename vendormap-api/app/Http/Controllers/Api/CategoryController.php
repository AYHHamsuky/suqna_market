<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Cache::remember('categories:all', config('vendormap.cache.categories'), function () {
            return Category::query()
                ->whereNull('parent_id')
                ->with('children')
                ->withCount('listings')
                ->orderBy('sort_order')
                ->get();
        });

        return response()->json(['data' => $categories]);
    }
}
