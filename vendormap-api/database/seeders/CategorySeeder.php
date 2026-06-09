<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Street Food & Drinks', 'icon' => 'soup'],
            ['name' => 'Fresh Produce & Farm Goods', 'icon' => 'plant-2'],
            ['name' => 'Dairy & Animal Products', 'icon' => 'milk'],
            ['name' => 'Clothing & Fabric', 'icon' => 'shirt'],
            ['name' => 'Repairs & Trades', 'icon' => 'tools'],
            ['name' => 'Personal Services', 'icon' => 'scissors'],
            ['name' => 'Household & Supplies', 'icon' => 'flame'],
            ['name' => 'Education & Skills', 'icon' => 'school'],
            ['name' => 'General Retail', 'icon' => 'building-store'],
        ];

        foreach ($categories as $i => $cat) {
            Category::updateOrCreate(
                ['slug' => Str::slug($cat['name'])],
                ['name' => $cat['name'], 'icon' => $cat['icon'], 'sort_order' => $i],
            );
        }
    }
}
