<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SearchSynonym;
use App\Services\SearchService;
use Illuminate\Http\Request;

class SynonymController extends Controller
{
    public function index(Request $request)
    {
        $query = SearchSynonym::query()
            ->when($request->filled('q'), fn ($q) => $q
                ->where('search_term', 'like', '%'.$request->input('q').'%')
                ->orWhere('canonical_tag', 'like', '%'.$request->input('q').'%'))
            ->orderBy('canonical_tag');

        return response()->json($query->paginate(min((int) $request->input('per_page', 50), 100)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'search_term' => ['required', 'string', 'max:255'],
            'canonical_tag' => ['required', 'string', 'max:255'],
            'language' => ['nullable', 'string', 'max:20'],
        ]);

        $synonym = SearchSynonym::create($data);
        SearchService::clearCaches();

        return response()->json(['data' => $synonym], 201);
    }

    public function destroy(int $id)
    {
        SearchSynonym::findOrFail($id)->delete();
        SearchService::clearCaches();

        return response()->json(['message' => 'Synonym deleted.']);
    }
}
