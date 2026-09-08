# Suqna

**Suqna — The Local Commerce Platform for Nigeria** is a location-aware marketplace that connects customers with nearby vendors of any goods or services (gullisuwa, tuwan madara, phone repair, tailoring…). It is built for the informal and semi-formal economy that drives most real commerce in Nigerian cities — vendors list exactly as they operate, in their own language, with flexible pricing.

This repository contains a full, runnable implementation: a Laravel API, a React web app, and a Flutter customer app, all sharing the same backend.

```text
vendormap-api/   Laravel 12 REST API (PHP, MySQL, Sanctum, Spatie roles)
vendormap-web/   React 19 + Vite web app (customer, vendor & admin UI)
suqna_mobile/    Flutter customer app (Riverpod, go_router, Dio)
```

> The API and web app are named `vendormap` internally — both names refer to the same project.

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Repository layout](#repository-layout)
4. [Prerequisites](#prerequisites)
5. [Quick start](#quick-start)
6. [Demo accounts](#demo-accounts)
7. [Mobile app](#mobile-app)
8. [API overview](#api-overview)
9. [Search & discovery](#search--discovery)
10. [Payments & commission](#payments--commission)
11. [Local vs. production substitutions](#local-vs-production-substitutions)
12. [Roadmap](#roadmap)

## Features

| Area | Status |
| --- | --- |
| Auth for customer / vendor / admin (Sanctum tokens + Spatie roles) | ✅ |
| Vendor profiles with GPS `POINT` + MySQL spatial radius search (`ST_Distance_Sphere`) | ✅ |
| Listings CRUD with 4 pricing modes (fixed / range / per-unit / ask), tags, image upload | ✅ |
| Intelligent search — FULLTEXT + synonym/alias resolution + fuzzy matching + tag overlap | ✅ |
| Autocomplete suggestions | ✅ |
| Map discovery (Leaflet + OpenStreetMap), vendor pins, popups, directions | ✅ |
| Price comparison list with Cheapest / Closest / Top-rated badges, sort & filters | ✅ |
| Cart → checkout → commission-aware orders → payment → vendor wallet credit | ✅ |
| Paystack integration (mock locally, real API via `.env`) + webhook handler | ✅ |
| Order lifecycle: pending → confirmed → preparing → ready/dispatched → completed | ✅ |
| Ratings & reviews (post-purchase only) with vendor replies | ✅ |
| In-app messaging (polling-based; Reverb/WebSocket swappable) | ✅ |
| Vendor dashboard — analytics, listings, orders, reviews, payouts | ✅ |
| Admin panel — vendor approval, synonym management, orders, payouts, platform analytics | ✅ |
| Wishlist, query result caching | ✅ |

### Flexible pricing modes

Local goods are not always sold at fixed prices, so every listing supports one of four modes:

| Mode | Description | Example |
| --- | --- | --- |
| Fixed price | Exact amount per unit | ₦500 per plate |
| Price range | Min and max | ₦200–₦500 per wrap |
| Price per unit | Amount with a selectable unit | ₦800 per kg |
| Ask vendor | No price shown, customer initiates chat | Negotiable |

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | Laravel 12, PHP 8.5, Laravel Sanctum, Spatie Laravel Permission |
| Database | MySQL 8 with spatial `POINT`/`SPATIAL INDEX`, FULLTEXT search |
| Web frontend | React 19, Vite, TailwindCSS v4, TanStack Query, Zustand, React Router, Leaflet |
| Mobile | Flutter, Riverpod, go_router, Dio, flutter_map (OpenStreetMap) |
| Payments | Paystack (mock/sandbox locally, live via `.env`) |
| Real-time | Polling by default; Laravel Reverb (WebSocket) swappable in |

## Repository layout

```text
local_suq/
├── vendormap-api/    Laravel API — controllers, models, migrations, routes/api.php
├── vendormap-web/    React SPA — customer, vendor dashboard, admin panel
├── suqna_mobile/     Flutter customer app
├── start-suqna.sh    Starts API + web app together
└── start-vendormap.sh  Alternate helper script
```

## Prerequisites

- PHP 8.5 and Composer
- MySQL 8
- Node.js 22 and npm
- Flutter SDK 3.11+ for the mobile app

The default local database configuration expects MySQL at `127.0.0.1:3306` with database `local_db`, user `root`, and no password. Adjust the API `.env` file if your local setup differs.

## Quick start

From the repository root, start the Laravel API and React web app together:

```bash
./start-suqna.sh
```

Then open <http://localhost:5174>. The API is available at <http://localhost:8000>.

To start the two services separately:

```bash
# Terminal 1 — API
cd vendormap-api
php artisan serve

# Terminal 2 — Web
cd vendormap-web
npm install
npm run dev
```

`./start-vendormap.sh` is an alternate helper that does the same thing.

## Demo accounts

All demo accounts use the password `password`:

| Role | Email |
| --- | --- |
| Admin | `admin@suqna.ng` |
| Vendor | `vendor@suqna.ng` |
| Customer | `customer@suqna.ng` |

The API seeds approved vendors (street food, dairy, produce, tailoring, phone repair, fabric, household) and sample listings, plus a pending vendor for the admin-approval demo. Reset local demo data with:

```bash
cd vendormap-api
php artisan migrate:fresh --seed
```

## Mobile app

The Flutter app (`suqna_mobile/`) covers auth, home/search/map discovery, listing detail with cart & wishlist, single-vendor checkout with mock Paystack, order tracking with reorder, in-app messaging with a new-message sound, and profile settings.

Start the backend first, then run the app:

```bash
./start-suqna.sh        # API binds 0.0.0.0:8000 so it's reachable on the LAN
cd suqna_mobile
flutter pub get
flutter run
```

Set the API base URL in the app's Profile → Settings screen, or in `suqna_mobile/lib/core/config.dart`:

| Target | API base URL |
| --- | --- |
| iOS simulator or macOS | `http://127.0.0.1:8000/api/v1` |
| Android emulator | `http://10.0.2.2:8000/api/v1` |
| Physical phone on the same Wi-Fi | `http://<your-mac-LAN-IP>:8000/api/v1` |

Demo login: `customer@suqna.ng` / `password`. See [suqna_mobile/README.md](suqna_mobile/README.md) for full mobile feature notes.

## API overview

All endpoints are prefixed with `/api/v1`. Highlights:

```text
POST   /auth/register/customer | /auth/register/vendor | /auth/login | /auth/logout
GET    /auth/me

GET    /vendors                        -- paginated list with filters
GET    /vendors/{slug}                 -- public profile, listings, reviews
GET    /vendors/map                    -- vendor pins within radius (lat, lng, radius_km)

GET    /listings                       -- search & filter (q, category, lat/lng, radius_km, price range, sort)
GET    /listings/{id}

GET/PUT /vendor/profile                -- vendor dashboard (auth, vendor role)
GET/POST/PUT/DELETE /vendor/listings
GET/PUT /vendor/orders, /vendor/orders/{id}/status
GET    /vendor/analytics, /vendor/payouts

GET/POST /customer/orders              -- customer dashboard (auth, customer role)
POST   /customer/reviews
GET/POST/DELETE /customer/wishlist

GET    /conversations, /conversations/{id}/messages
POST   /conversations, /conversations/{id}/messages

POST   /checkout/initiate              -- returns Paystack redirect URL
POST   /payments/webhook/paystack      -- webhook (no auth), verified by signature

GET/PUT /admin/vendors/pending, /{id}/approve, /{id}/suspend   -- (auth, admin role)
GET    /admin/orders, /admin/payouts/pending, /admin/analytics/overview
GET/POST/DELETE /admin/synonyms
```

See `vendormap-api/routes/api.php` for the full route list.

## Search & discovery

Search resolves in stages: normalize the query → look up synonyms/aliases (e.g. "tuwan madara" → `tuwo`, `swallow`, `local food`) → FULLTEXT match on listing name/description → tag overlap match → merge & deduplicate → apply radius/category/price filters → sort by relevance, price, distance, or rating.

Vendor radius search uses MySQL spatial functions:

```sql
SELECT vp.id, vp.business_name,
       ST_Distance_Sphere(vp.coordinates, POINT(?, ?)) / 1000 AS distance_km
FROM vendor_profiles vp
WHERE ST_Distance_Sphere(vp.coordinates, POINT(?, ?)) <= ? * 1000
  AND vp.is_approved = TRUE
ORDER BY distance_km ASC;
```

## Payments & commission

On checkout, Paystack captures the full order amount. The webhook marks the payment successful, deducts a configurable commission percentage (snapshotted per order), credits the vendor wallet with the remainder, and moves the order to `confirmed`. Vendors request payouts to their bank account from the dashboard.

## Local vs. production substitutions

| Concern | Local | Production |
| --- | --- | --- |
| Maps | Leaflet + OpenStreetMap (no key) | Add a Google Maps key and swap the tile layer, or keep OSM |
| Cache / queue | Database / sync drivers | `CACHE_STORE=redis`, `QUEUE_CONNECTION=redis` |
| Payments | Mock checkout (`PAYMENTS_MOCK=true`) | Set live Paystack keys, `PAYMENTS_MOCK=false` |
| Real-time chat | Polling | Enable Laravel Reverb broadcasting |
| File storage | Local `public` disk | S3 disk |

## Roadmap

Native mobile push notifications (FCM), delivery/dispatch integration, vendor subscription tiers, group buying, AI-powered recommendations, a full Hausa-language UI, multi-city expansion, vendor inventory alerts, a loyalty programme, and B2B bulk ordering.

For the original product specification (market analysis, full database schema, development phases), see [VendorMap_Project_Document.md](VendorMap_Project_Document.md).
