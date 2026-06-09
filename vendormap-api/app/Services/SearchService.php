<?php

namespace App\Services;

use App\Models\Listing;
use App\Models\SearchSynonym;
use App\Models\VendorProfile;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Intelligent search & discovery engine.
 *
 * Implements the query flow described in the project document:
 *   normalise → synonym lookup → fulltext + tag match → filters → sort → distance.
 */
class SearchService
{
    /** Normalise a raw query: lowercase, trim, strip diacritics. */
    public function normalise(?string $q): string
    {
        $q = Str::lower(trim((string) $q));
        // Strip diacritics (transliterate to ASCII).
        $ascii = Str::ascii($q);
        return trim($ascii);
    }

    /**
     * Resolve a query into the set of search terms (original words + synonym canonical tags).
     *
     * @return array{words: array<string>, tags: array<string>}
     */
    public function resolveTerms(string $normalised): array
    {
        $words = array_values(array_filter(preg_split('/\s+/', $normalised)));
        $tags = [];

        if ($normalised !== '') {
            $synonyms = $this->allSynonyms();
            // Match full phrase first, then individual words.
            $candidates = array_unique(array_merge([$normalised], $words));
            foreach ($candidates as $cand) {
                foreach ($synonyms as $syn) {
                    if ($syn['search_term'] === $cand) {
                        $tags[] = $syn['canonical_tag'];
                    }
                }
            }
        }

        return [
            'words' => $words,
            'tags' => array_values(array_unique($tags)),
        ];
    }

    /** Cached list of all synonym mappings (normalised search terms). */
    protected function allSynonyms(): array
    {
        return Cache::remember('synonyms:all', config('vendormap.cache.synonyms'), function () {
            return SearchSynonym::all()->map(fn ($s) => [
                'search_term' => $this->normalise($s->search_term),
                'canonical_tag' => Str::lower($s->canonical_tag),
            ])->all();
        });
    }

    /**
     * Build the listing search query with relevance, distance, and filters applied.
     *
     * @param array $p  q, category, lat, lng, radius_km, price_min, price_max, sort, available_only
     */
    public function listingQuery(array $p): Builder
    {
        $normalised = $this->normalise($p['q'] ?? null);
        $terms = $this->resolveTerms($normalised);
        $hasGeo = isset($p['lat'], $p['lng']) && is_numeric($p['lat']) && is_numeric($p['lng']);

        $query = Listing::query()
            ->select('listings.*')
            ->join('vendor_profiles as vp', 'vp.id', '=', 'listings.vendor_id')
            ->where('vp.is_approved', true)
            ->whereNull('vp.deleted_at')
            ->with(['vendor:id,business_name,slug,city,state,latitude,longitude,rating_avg,rating_count,is_open,logo', 'category:id,name,slug,icon']);

        if (($p['available_only'] ?? true)) {
            $query->where('listings.is_available', true);
        }

        // --- Text relevance: fulltext (query-tight) + tag overlap (synonym-driven) + LIKE fuzzy fallback ---
        if ($normalised !== '') {
            // Fulltext stays tight to the typed query to avoid generic-word pollution;
            // synonym canonical tags drive the tag-overlap match instead.
            $tagsJson = json_encode(array_values(array_unique(array_merge($terms['words'], $terms['tags']))));

            $query->selectRaw(
                'MATCH(listings.name, listings.description) AGAINST (? IN NATURAL LANGUAGE MODE) AS relevance',
                [$normalised]
            );

            $query->where(function (Builder $w) use ($normalised, $tagsJson) {
                $w->whereRaw('MATCH(listings.name, listings.description) AGAINST (? IN NATURAL LANGUAGE MODE)', [$normalised])
                  ->orWhere('listings.name', 'like', "%{$normalised}%")
                  ->orWhere('listings.description', 'like', "%{$normalised}%")
                  ->orWhereRaw('JSON_OVERLAPS(COALESCE(listings.tags, JSON_ARRAY()), CAST(? AS JSON))', [$tagsJson]);
            });
        } else {
            $query->selectRaw('0 AS relevance');
        }

        // --- Filters ---
        if (! empty($p['category'])) {
            // accept id or slug
            if (is_numeric($p['category'])) {
                $query->where('listings.category_id', (int) $p['category']);
            } else {
                $query->whereHas('category', fn ($c) => $c->where('slug', $p['category']));
            }
        }

        if (isset($p['price_min']) && is_numeric($p['price_min'])) {
            $query->whereRaw('COALESCE(listings.price, listings.price_min) >= ?', [(float) $p['price_min']]);
        }
        if (isset($p['price_max']) && is_numeric($p['price_max'])) {
            $query->whereRaw('COALESCE(listings.price, listings.price_max, listings.price_min) <= ?', [(float) $p['price_max']]);
        }
        if (isset($p['min_rating']) && is_numeric($p['min_rating'])) {
            $query->where('vp.rating_avg', '>=', (float) $p['min_rating']);
        }

        // --- Distance (MySQL spatial) ---
        if ($hasGeo) {
            $lat = (float) $p['lat'];
            $lng = (float) $p['lng'];
            $radiusKm = min((float) ($p['radius_km'] ?? config('vendormap.default_radius_km')), config('vendormap.max_radius_km'));

            // ST_Distance_Sphere expects POINT(lng, lat); coordinates stored same way.
            $query->selectRaw(
                'ST_Distance_Sphere(vp.coordinates, ST_SRID(POINT(?, ?), 4326)) / 1000 AS distance_km',
                [$lng, $lat]
            );
            $query->whereRaw(
                'ST_Distance_Sphere(vp.coordinates, ST_SRID(POINT(?, ?), 4326)) <= ?',
                [$lng, $lat, $radiusKm * 1000]
            );
        } else {
            $query->selectRaw('NULL AS distance_km');
        }

        // --- Sorting ---
        $sort = $p['sort'] ?? 'relevance';
        match ($sort) {
            'price' => $query->orderByRaw('COALESCE(listings.price, listings.price_min) ASC'),
            'price_desc' => $query->orderByRaw('COALESCE(listings.price, listings.price_max, listings.price_min) DESC'),
            'distance' => $hasGeo ? $query->orderBy('distance_km') : $query->orderByDesc('listings.is_featured'),
            'rating' => $query->orderByDesc('vp.rating_avg'),
            'newest' => $query->orderByDesc('listings.created_at'),
            default => $normalised !== ''
                ? $query->orderByDesc('relevance')->orderByDesc('listings.is_featured')
                : $query->orderByDesc('listings.is_featured')->orderByDesc('listings.created_at'),
        };

        return $query;
    }

    /**
     * Vendors within a radius for map pins.
     *
     * @return \Illuminate\Support\Collection
     */
    public function vendorsForMap(float $lat, float $lng, float $radiusKm, ?string $q = null)
    {
        $radiusKm = min($radiusKm, config('vendormap.max_radius_km'));
        $cacheKey = 'vendor:map:'.round($lat, 3).':'.round($lng, 3).':'.$radiusKm.':'.md5((string) $q);

        return Cache::remember($cacheKey, config('vendormap.cache.map'), function () use ($lat, $lng, $radiusKm, $q) {
            $query = VendorProfile::query()
                ->select('vendor_profiles.id', 'business_name', 'slug', 'city', 'latitude', 'longitude', 'rating_avg', 'rating_count', 'is_open', 'category_id', 'logo')
                ->selectRaw('ST_Distance_Sphere(coordinates, ST_SRID(POINT(?, ?), 4326)) / 1000 AS distance_km', [$lng, $lat])
                ->where('is_approved', true)
                ->whereRaw('ST_Distance_Sphere(coordinates, ST_SRID(POINT(?, ?), 4326)) <= ?', [$lng, $lat, $radiusKm * 1000])
                ->with(['category:id,name,slug,icon'])
                ->withCount(['listings' => fn ($l) => $l->where('is_available', true)])
                ->orderBy('distance_km');

            if ($q) {
                $normalised = $this->normalise($q);
                $terms = $this->resolveTerms($normalised);
                $tagsJson = json_encode(array_values(array_unique(array_merge($terms['words'], $terms['tags']))));
                $query->whereHas('listings', function (Builder $l) use ($normalised, $tagsJson) {
                    $l->where('is_available', true)->where(function (Builder $w) use ($normalised, $tagsJson) {
                        $w->whereRaw('MATCH(name, description) AGAINST (? IN NATURAL LANGUAGE MODE)', [$normalised])
                          ->orWhere('name', 'like', "%{$normalised}%")
                          ->orWhereRaw('JSON_OVERLAPS(COALESCE(tags, JSON_ARRAY()), CAST(? AS JSON))', [$tagsJson]);
                    });
                });
            }

            return $query->limit(500)->get()->each(function ($v) {
                $v->top_listing = $v->listings()->where('is_available', true)->orderByDesc('is_featured')->first(['id', 'name', 'price', 'pricing_mode', 'price_min', 'price_max', 'price_unit']);
            });
        });
    }

    /** Autocomplete suggestions from listing names and synonyms. */
    public function suggest(string $q, int $limit = 8): array
    {
        $normalised = $this->normalise($q);
        if (Str::length($normalised) < 2) {
            return [];
        }

        $names = Listing::query()
            ->where('is_available', true)
            ->where('name', 'like', "%{$normalised}%")
            ->distinct()
            ->orderBy('name')
            ->limit($limit)
            ->pluck('name')
            ->all();

        $synTerms = collect($this->allSynonyms())
            ->filter(fn ($s) => Str::contains($s['search_term'], $normalised))
            ->pluck('search_term')
            ->all();

        return collect(array_merge($names, $synTerms))
            ->map(fn ($s) => Str::title($s))
            ->unique()
            ->take($limit)
            ->values()
            ->all();
    }

    public static function clearCaches(): void
    {
        Cache::forget('synonyms:all');
        // Map/search caches expire quickly by TTL; explicit flush not required here.
    }
}
