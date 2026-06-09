# VendorMap — Working MVP

A location-aware marketplace connecting customers with nearby vendors of any goods or services
(gullisuwa, tuwan madara, phone repair, tailoring…), built from `VendorMap_Project_Document.md`.

This repo contains a **full, runnable MVP** of every core feature in the spec.

```
local_suq/
├── vendormap-api/   Laravel 12 REST API  (PHP 8.5, MySQL `local_db`, Sanctum, Spatie roles)
├── vendormap-web/   React 19 SPA         (Vite, Tailwind v4, React Query, Zustand, Leaflet)
└── VendorMap_Project_Document.md
```

## What's implemented

| Area | Status |
|---|---|
| Auth (customer / vendor / admin) — Sanctum tokens + Spatie roles | ✅ |
| Vendor profiles with GPS `POINT` + **MySQL spatial** radius search (`ST_Distance_Sphere`) | ✅ |
| Listings CRUD, 4 pricing modes (fixed / range / per-unit / ask), tags, image upload | ✅ |
| Intelligent search — FULLTEXT + **synonym/alias** resolution + fuzzy LIKE + tag overlap | ✅ |
| Autocomplete suggestions | ✅ |
| Map discovery (Leaflet + OpenStreetMap), vendor pins, popups, directions | ✅ |
| Price comparison list with **Cheapest / Closest / Top-rated** badges, sort & filters | ✅ |
| Cart → checkout → **commission-aware** orders → payment → vendor wallet credit | ✅ |
| Paystack integration (sandbox/mock locally; real API wired via `.env`) + webhook handler | ✅ |
| Order lifecycle (pending→confirmed→preparing→ready/dispatched→completed) | ✅ |
| Ratings & reviews (post-purchase only) + vendor replies | ✅ |
| In-app messaging (polling-based; Reverb/WebSocket swappable) | ✅ |
| Vendor dashboard — analytics, listings, orders, reviews, payouts | ✅ |
| Admin panel — vendor approval, synonyms, orders, payouts, platform analytics | ✅ |
| Wishlist, Redis-style cache (DB driver locally) | ✅ |

## Local substitutions (swap for production via `.env`)

| Spec | Local | Production |
|---|---|---|
| Google Maps API | Leaflet + OpenStreetMap (no key) | add key, swap tile layer |
| Redis cache/queue | database / sync drivers | set `CACHE_STORE=redis`, `QUEUE_CONNECTION=redis` |
| Paystack live | mock checkout (`PAYMENTS_MOCK=true`) | set keys, `PAYMENTS_MOCK=false` |
| Reverb WebSockets | chat polling | enable Reverb broadcasting |
| AWS S3 | local `public` disk | set S3 disk |

## Prerequisites (already present on this machine)

- PHP 8.5 + Composer, Node 22 + npm
- MySQL 8 via **Herd** (`127.0.0.1:3306`, user `root`, no password, database `local_db`)

> Note: `vendormap-web/node_modules` is a symlink to `~/.vendormap-node-modules/web`
> (kept off iCloud Drive — npm cannot reliably write thousands of files into an iCloud-synced folder).

## Run it

```bash
# Terminal 1 — API  (http://localhost:8000)
cd vendormap-api
php artisan serve

# Terminal 2 — Web  (http://localhost:5174)
cd vendormap-web
npm run dev
```

Open **http://localhost:5174**.

Or use the helper: `./start-vendormap.sh` (starts both).

## Demo logins (password: `password`)

| Role | Login |
|---|---|
| Admin | `admin@vendormap.ng` |
| Vendor | `vendor@vendormap.ng` (Zainab's Kitchen) |
| Customer | `customer@vendormap.ng` |

8 approved Kaduna vendors are seeded (street food, dairy, produce, tailoring, phone repair, fabric,
household) plus 1 pending vendor for the admin approval demo.

## Reset demo data

```bash
cd vendormap-api && php artisan migrate:fresh --seed
```

## Key API endpoints (`/api/v1`)

- `GET /listings?q=tuwan madara&lat=&lng=&radius_km=&sort=` — search (synonyms + spatial)
- `GET /vendors/map?lat=&lng=&radius_km=` — map pins
- `POST /customer/orders`, `POST /checkout/initiate`, `POST /payments/verify`
- `GET /vendor/analytics`, `GET /admin/analytics/overview`

See `vendormap-api/routes/api.php` for the full list (56 routes).
