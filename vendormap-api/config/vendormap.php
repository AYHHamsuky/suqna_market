<?php

return [
    // Default platform commission percentage applied to orders.
    'default_commission_rate' => (float) env('VENDORMAP_DEFAULT_COMMISSION_RATE', 10),

    // Whether payments run in mock mode (no real gateway calls).
    'payments_mock' => (bool) env('PAYMENTS_MOCK', true),

    // Default search radius (km) when none supplied.
    'default_radius_km' => 10,
    'max_radius_km' => 50,

    // Nigerian geographic bounds for coordinate validation.
    'geo_bounds' => [
        'lat_min' => 3.0,
        'lat_max' => 14.5,
        'lng_min' => 2.0,
        'lng_max' => 15.5,
    ],

    // Cache TTLs in seconds.
    'cache' => [
        'search' => 300,     // 5 min
        'map' => 120,        // 2 min
        'listing' => 600,    // 10 min
        'vendor' => 600,     // 10 min
        'categories' => 3600, // 1 hour
        'synonyms' => 3600,   // 1 hour
    ],
];
