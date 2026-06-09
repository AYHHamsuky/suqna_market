<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Listing;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Review;
use App\Models\User;
use App\Models\VendorProfile;
use App\Services\CommissionService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $cats = Category::pluck('id', 'slug');
        $commission = new CommissionService();

        // Themed photo keyword per category (single word — LoremFlickr AND-matches commas,
        // so a single common term reliably returns a real photo).
        $imageKeywords = [
            'street-food-drinks' => 'food',
            'fresh-produce-farm-goods' => 'vegetables',
            'dairy-animal-products' => 'milk',
            'clothing-fabric' => 'fabric',
            'repairs-trades' => 'workshop',
            'personal-services' => 'tailor',
            'household-supplies' => 'firewood',
            'education-skills' => 'classroom',
            'general-retail' => 'shop',
        ];

        // --- Admin ---
        $admin = User::updateOrCreate(
            ['email' => 'admin@suqna.ng'],
            ['name' => 'Suqna Admin', 'password' => Hash::make('password'), 'role' => 'admin', 'phone' => '08000000001']
        );
        $admin->syncRoles('admin');

        // --- Customers ---
        $customer = User::updateOrCreate(
            ['email' => 'customer@suqna.ng'],
            ['name' => 'Amina Yusuf', 'password' => Hash::make('password'), 'role' => 'customer', 'phone' => '08000000002']
        );
        $customer->syncRoles('customer');

        $customer2 = User::updateOrCreate(
            ['email' => 'bello@suqna.ng'],
            ['name' => 'Bello Sani', 'password' => Hash::make('password'), 'role' => 'customer', 'phone' => '08000000003']
        );
        $customer2->syncRoles('customer');

        // --- Vendors with listings (Kaduna) ---
        $vendors = [
            [
                'login' => 'vendor@suqna.ng', 'owner' => 'Hajiya Zainab', 'phone' => '08010000001',
                'business' => "Zainab's Kitchen", 'category' => 'street-food-drinks', 'approved' => true,
                'address' => 'Tudun Wada, opposite the central mosque', 'lat' => 10.5167, 'lng' => 7.4333,
                'desc' => 'Home-style Hausa breakfast and lunch — tuwo, miya, and fresh kunu every morning.',
                'listings' => [
                    ['Tuwan Madara', 'fixed', 500, null, null, 'plate', ['tuwo', 'swallow', 'local food', 'breakfast'], 'Soft tuwo served with fresh milk and honey.'],
                    ['Tuwon Shinkafa & Miyan Kuka', 'fixed', 800, null, null, 'plate', ['tuwo', 'swallow', 'rice food', 'lunch'], 'Rice swallow with kuka soup and assorted meat.'],
                    ['Kunun Gyada', 'range', null, 150, 300, 'cup', ['kunu', 'drink', 'local drink'], 'Groundnut kunu, freshly made daily.'],
                    ['Danwake', 'fixed', 400, null, null, 'plate', ['danwake', 'street food'], 'Bean-flour dumplings with pepper and oil.'],
                ],
            ],
            [
                'login' => 'suya@suqna.ng', 'owner' => 'Mallam Garba', 'phone' => '08010000002',
                'business' => 'Garba Suya Spot', 'category' => 'street-food-drinks', 'approved' => true,
                'address' => 'Ahmadu Bello Way, near GRA junction', 'lat' => 10.5230, 'lng' => 7.4380,
                'desc' => 'The best evening suya and tsire in Kaduna, grilled to order.',
                'listings' => [
                    ['Beef Suya', 'per_unit', 1000, null, null, 'wrap', ['suya', 'tsire', 'grilled meat', 'street food'], 'Spiced grilled beef with yaji and onions.'],
                    ['Tsire (stick)', 'fixed', 200, null, null, 'stick', ['suya', 'tsire', 'grilled meat'], 'Single stick of peppered grilled beef.'],
                    ['Grilled Chicken', 'range', null, 1500, 3500, 'portion', ['suya', 'grilled meat', 'chicken'], 'Quarter to full grilled chicken with spice.'],
                ],
            ],
            [
                'login' => 'dairy@suqna.ng', 'owner' => 'Fatima Ardo', 'phone' => '08010000003',
                'business' => 'Ardo Fresh Dairy', 'category' => 'dairy-animal-products', 'approved' => true,
                'address' => 'Rigasa market, dairy section', 'lat' => 10.5450, 'lng' => 7.3800,
                'desc' => 'Fresh Fulani dairy — nono, wara and madara delivered each morning.',
                'listings' => [
                    ['Fresh Nono (Yoghurt)', 'range', null, 200, 500, 'bottle', ['nono', 'yoghurt', 'dairy'], 'Naturally fermented Fulani yoghurt.'],
                    ['Wara (Local Cheese)', 'fixed', 150, null, null, 'piece', ['wara', 'cheese', 'dairy'], 'Soft fried local cheese.'],
                    ['Madara (Fresh Milk)', 'per_unit', 600, null, null, 'litre', ['madara', 'milk', 'dairy'], 'Fresh cow milk by the litre.'],
                    ['Fura da Nono', 'fixed', 350, null, null, 'cup', ['fura', 'fura da nono', 'drink', 'dairy'], 'Millet balls in fresh nono.'],
                ],
            ],
            [
                'login' => 'produce@suqna.ng', 'owner' => 'Yakubu Musa', 'phone' => '08010000004',
                'business' => 'Musa Farm Fresh', 'category' => 'fresh-produce-farm-goods', 'approved' => true,
                'address' => 'Kasuwan Barci, Sabon Gari', 'lat' => 10.5300, 'lng' => 7.4400,
                'desc' => 'Farm-fresh tomatoes, onions, pepper and grains direct from the farm.',
                'listings' => [
                    ['Fresh Tomatoes', 'per_unit', 1200, null, null, 'basket', ['tomatoes', 'produce', 'vegetables'], 'Ripe tomatoes by the small basket.'],
                    ['Red Onions', 'per_unit', 800, null, null, 'mudu', ['onions', 'produce'], 'Sharp red onions, priced per mudu.'],
                    ['Dried Pepper (Yaji)', 'per_unit', 500, null, null, 'cup', ['pepper', 'produce', 'spice'], 'Ground dry pepper.'],
                    ['Dabino (Dates)', 'range', null, 700, 2000, 'pack', ['dabino', 'dates', 'fruit'], 'Sweet dates in assorted pack sizes.'],
                ],
            ],
            [
                'login' => 'tailor@suqna.ng', 'owner' => 'Aisha Bala', 'phone' => '08010000005',
                'business' => 'Aisha Couture', 'category' => 'personal-services', 'approved' => true,
                'address' => 'Kawo, behind the new market', 'lat' => 10.5600, 'lng' => 7.4450,
                'desc' => 'Custom tailoring for kaftan, gown and traditional wear.',
                'listings' => [
                    ['Kaftan Sewing', 'range', null, 5000, 15000, 'outfit', ['tailoring', 'sewing', 'kaftan', 'fashion'], 'Custom-sewn kaftan, fabric not included.'],
                    ['Ladies Gown', 'ask', null, null, null, 'outfit', ['tailoring', 'sewing', 'fashion'], 'Bespoke gowns — chat for a quote.'],
                    ['Babbar Riga (Agbada)', 'fixed', 20000, null, null, 'set', ['babbar riga', 'agbada', 'tailoring', 'clothing'], 'Three-piece grand boubou sewing.'],
                ],
            ],
            [
                'login' => 'repair@suqna.ng', 'owner' => 'Ibrahim Lawal', 'phone' => '08010000006',
                'business' => 'Lawal Phone Clinic', 'category' => 'repairs-trades', 'approved' => true,
                'address' => 'Kaduna Central Market, electronics line', 'lat' => 10.5180, 'lng' => 7.4360,
                'desc' => 'Phone screen, battery and software repairs while you wait.',
                'listings' => [
                    ['Phone Screen Replacement', 'ask', null, null, null, 'job', ['phone repair', 'gsm', 'electronics repair'], 'Price depends on phone model — send a chat.'],
                    ['Battery Replacement', 'range', null, 3000, 12000, 'job', ['phone repair', 'gsm', 'battery'], 'Original and OEM batteries available.'],
                    ['Software / Flashing', 'fixed', 2500, null, null, 'job', ['phone repair', 'gsm', 'software'], 'Reflash, unlock and software fixes.'],
                ],
            ],
            [
                'login' => 'fabric@suqna.ng', 'owner' => 'Halima Idris', 'phone' => '08010000007',
                'business' => 'Halima Fabrics', 'category' => 'clothing-fabric', 'approved' => true,
                'address' => 'Sheikh Gumi Central Market', 'lat' => 10.5120, 'lng' => 7.4300,
                'desc' => 'Ankara, atamfa, lace and guinea brocade at market prices.',
                'listings' => [
                    ['Ankara (6 yards)', 'range', null, 4000, 12000, 'piece', ['ankara', 'atamfa', 'fabric', 'cloth'], 'Quality wax print, 6-yard pieces.'],
                    ['Guinea Brocade', 'per_unit', 3500, null, null, 'yard', ['guinea brocade', 'fabric', 'cloth'], 'Soft shadda guinea, per yard.'],
                    ['Lace Material', 'range', null, 8000, 35000, 'piece', ['lace', 'fabric', 'cloth'], 'French and cord lace for occasions.'],
                ],
            ],
            [
                'login' => 'household@suqna.ng', 'owner' => 'Sani Abdullahi', 'phone' => '08010000008',
                'business' => 'Sani Household Supplies', 'category' => 'household-supplies', 'approved' => true,
                'address' => 'Barnawa shopping complex', 'lat' => 10.4800, 'lng' => 7.4200,
                'desc' => 'Firewood, charcoal, kerosene, gas refill and sachet water.',
                'listings' => [
                    ['Firewood Bundle', 'fixed', 1500, null, null, 'bundle', ['firewood', 'itace', 'household'], 'Dry firewood, large bundle.'],
                    ['Charcoal', 'per_unit', 2000, null, null, 'bag', ['charcoal', 'household'], 'Hardwood charcoal by the bag.'],
                    ['Gas Refill', 'per_unit', 1200, null, null, 'kg', ['gas cylinder', 'cooking gas', 'household'], 'Cooking gas refill per kg.'],
                    ['Sachet Water (Bag)', 'fixed', 300, null, null, 'bag', ['sachet water', 'pure water', 'ruwa', 'household'], 'Bag of 20 sachets of pure water.'],
                ],
            ],
            // A pending vendor for the admin approval demo.
            [
                'login' => 'pending@suqna.ng', 'owner' => 'Murtala Kabir', 'phone' => '08010000009',
                'business' => 'Kabir Computer Training', 'category' => 'education-skills', 'approved' => false,
                'address' => 'Unguwan Rimi, near the school', 'lat' => 10.5400, 'lng' => 7.4500,
                'desc' => 'Computer training, typing and basic ICT classes for all ages.',
                'listings' => [
                    ['Computer Basics Class', 'fixed', 15000, null, null, 'month', ['computer training', 'ict', 'education'], 'One month of beginner ICT classes.'],
                    ['Typing & MS Office', 'fixed', 10000, null, null, 'month', ['computer training', 'ict', 'education'], 'Touch typing and Office productivity.'],
                ],
            ],
        ];

        $created = [];
        foreach ($vendors as $v) {
            $user = User::updateOrCreate(
                ['email' => $v['login']],
                ['name' => $v['owner'], 'password' => Hash::make('password'), 'role' => 'vendor', 'phone' => $v['phone']]
            );
            $user->syncRoles('vendor');

            $profile = VendorProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'business_name' => $v['business'],
                    'category_id' => $cats[$v['category']],
                    'description' => $v['desc'],
                    'address' => $v['address'],
                    'city' => 'Kaduna',
                    'state' => 'Kaduna',
                    'latitude' => $v['lat'],
                    'longitude' => $v['lng'],
                    'phone' => $v['phone'],
                    'is_approved' => $v['approved'],
                    'banner' => self::imageUrl($imageKeywords[$v['category']] ?? 'market', crc32($v['business']) % 900, 1200, 400),
                    'operating_hours' => [
                        'mon' => ['open' => '08:00', 'close' => '18:00'],
                        'tue' => ['open' => '08:00', 'close' => '18:00'],
                        'wed' => ['open' => '08:00', 'close' => '18:00'],
                        'thu' => ['open' => '08:00', 'close' => '18:00'],
                        'fri' => ['open' => '08:00', 'close' => '13:00'],
                        'sat' => ['open' => '09:00', 'close' => '18:00'],
                        'sun' => ['open' => null, 'close' => null],
                    ],
                ]
            );

            foreach ($v['listings'] as $l) {
                [$name, $mode, $price, $min, $max, $unit, $tags, $descr] = $l;
                $kw = $imageKeywords[$v['category']] ?? 'market';
                Listing::updateOrCreate(
                    ['vendor_id' => $profile->id, 'name' => $name],
                    [
                        'category_id' => $cats[$v['category']],
                        'description' => $descr,
                        'pricing_mode' => $mode,
                        'price' => $price,
                        'price_min' => $min,
                        'price_max' => $max,
                        'price_unit' => $unit,
                        'tags' => $tags,
                        'is_available' => true,
                        'is_featured' => $price !== null && $price <= 800,
                        'images' => [self::imageUrl($kw, crc32($name) % 900)],
                    ]
                );
            }

            $created[$v['login']] = $profile;
        }

        // --- A few completed orders + reviews to populate ratings & analytics ---
        $this->seedOrder($created['vendor@suqna.ng'], $customer, $commission, 5, 'Best tuwo in Tudun Wada, very fresh!');
        $this->seedOrder($created['suya@suqna.ng'], $customer2, $commission, 4, 'Suya was great but I waited a while.');
        $this->seedOrder($created['dairy@suqna.ng'], $customer, $commission, 5, 'Nono and wara were excellent.');
        $this->seedOrder($created['vendor@suqna.ng'], $customer2, $commission, 4, null);

        // Recalculate vendor ratings.
        foreach ($created as $profile) {
            $profile->recalculateRating();
        }
    }

    /** Build a deterministic, keyword-themed photo URL (LoremFlickr, free, no API key). */
    protected static function imageUrl(string $keywords, int $lock, int $w = 600, int $h = 450): string
    {
        $kw = rawurlencode($keywords);
        return "https://loremflickr.com/{$w}/{$h}/{$kw}?lock={$lock}";
    }

    protected function seedOrder(VendorProfile $vendor, User $customer, CommissionService $commission, int $rating, ?string $review): void
    {
        $listing = $vendor->listings()->whereNotIn('pricing_mode', ['ask'])->first();
        if (! $listing) {
            return;
        }

        $unitPrice = $listing->effective_price ?? 0;
        $qty = 2;
        $subtotal = round($unitPrice * $qty, 2);
        $calc = $commission->calculate($subtotal, $commission->rateFor($vendor));

        $order = Order::create([
            'reference' => 'SQ-'.now()->format('Ymd').'-'.strtoupper(Str::random(6)),
            'customer_id' => $customer->id,
            'vendor_id' => $vendor->id,
            'status' => 'completed',
            'subtotal' => $subtotal,
            'commission_rate' => $calc['rate'],
            'commission_amt' => $calc['commission'],
            'vendor_payout' => $calc['payout'],
            'delivery_type' => 'pickup',
            'completed_at' => now()->subDays(rand(1, 7)),
        ]);

        $order->items()->create([
            'listing_id' => $listing->id,
            'listing_name' => $listing->name,
            'quantity' => $qty,
            'unit' => $listing->price_unit,
            'unit_price' => $unitPrice,
            'subtotal' => $subtotal,
        ]);

        Payment::create([
            'order_id' => $order->id,
            'gateway' => 'paystack',
            'gateway_ref' => 'VMPAY-'.strtoupper(Str::random(10)),
            'amount' => $subtotal,
            'status' => 'success',
            'paid_at' => now()->subDays(rand(1, 7)),
        ]);

        $vendor->increment('wallet_balance', $calc['payout']);

        Review::create([
            'order_id' => $order->id,
            'customer_id' => $customer->id,
            'vendor_id' => $vendor->id,
            'rating' => $rating,
            'body' => $review,
            'images' => [],
        ]);
    }
}
