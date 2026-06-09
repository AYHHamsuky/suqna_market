<?php

namespace Database\Seeders;

use App\Models\SearchSynonym;
use Illuminate\Database\Seeder;

class SynonymSeeder extends Seeder
{
    public function run(): void
    {
        // search_term => [canonical_tags...]
        $map = [
            'tuwo' => ['tuwo', 'swallow', 'local food'],
            'tuwon shinkafa' => ['tuwo', 'swallow', 'rice food'],
            'tuwan madara' => ['tuwo', 'swallow', 'local food'],
            'swallows' => ['tuwo', 'swallow'],
            'swallow' => ['tuwo', 'swallow'],
            'gullisuwa' => ['gullisuwa', 'street food', 'snack'],
            'kosai' => ['kosai', 'akara', 'bean cake', 'street food'],
            'akara' => ['kosai', 'akara', 'bean cake'],
            'danwake' => ['danwake', 'street food'],
            'kunu' => ['kunu', 'drink', 'local drink'],
            'zobo' => ['zobo', 'drink', 'local drink'],
            'suya' => ['suya', 'tsire', 'grilled meat', 'street food'],
            'tsire' => ['suya', 'tsire', 'grilled meat'],
            'fura' => ['fura', 'fura da nono', 'drink'],
            'nono' => ['nono', 'yoghurt', 'dairy'],
            'wara' => ['wara', 'cheese', 'dairy'],
            'madara' => ['madara', 'milk', 'dairy'],
            'masa' => ['masa', 'rice cake', 'street food'],
            'kuli kuli' => ['kuli kuli', 'groundnut snack', 'snack'],
            'dabino' => ['dabino', 'dates', 'fruit'],
            'ankara' => ['ankara', 'fabric', 'cloth'],
            'atamfa' => ['atamfa', 'ankara', 'fabric'],
            'kaftan' => ['kaftan', 'clothing'],
            'babbar riga' => ['babbar riga', 'agbada', 'clothing'],
            'tailor' => ['tailoring', 'sewing', 'fashion'],
            'tailoring' => ['tailoring', 'sewing'],
            'dinki' => ['tailoring', 'sewing'],
            'phone repair' => ['phone repair', 'gsm', 'electronics repair'],
            'gsm' => ['phone repair', 'gsm'],
            'welding' => ['welding', 'metal work', 'trades'],
            'mechanic' => ['mechanic', 'motor repair', 'trades'],
            'keke' => ['keke repair', 'tricycle', 'trades'],
            'barber' => ['barbing', 'haircut'],
            'wanki' => ['laundry', 'washing'],
            'lalle' => ['henna', 'lalle', 'beauty'],
            'henna' => ['henna', 'lalle', 'beauty'],
            'firewood' => ['firewood', 'itace', 'household'],
            'itace' => ['firewood', 'itace'],
            'kerosene' => ['kerosene', 'fuel', 'household'],
            'gas' => ['gas cylinder', 'cooking gas', 'household'],
            'sachet water' => ['sachet water', 'pure water', 'ruwa'],
            'pure water' => ['sachet water', 'pure water'],
            'ruwa' => ['sachet water', 'pure water', 'water'],
            'lesson' => ['lesson teacher', 'tutoring', 'education'],
            'quran' => ['quran teaching', 'islamiyya', 'education'],
            'computer training' => ['computer training', 'ict', 'education'],
        ];

        foreach ($map as $term => $tags) {
            foreach ($tags as $tag) {
                SearchSynonym::firstOrCreate(
                    ['search_term' => $term, 'canonical_tag' => $tag],
                    ['language' => 'any'],
                );
            }
        }
    }
}
