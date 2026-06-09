# VendorMap — Full Project Document

> A location-aware marketplace platform connecting customers with nearby vendors offering any goods or services — from gullisuwa and tuwan madara to phone repairs and tailoring.

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [The Problem We Are Solving](#2-the-problem-we-are-solving)
3. [Target Market](#3-target-market)
4. [Core User Roles](#4-core-user-roles)
5. [Key Features](#5-key-features)
6. [Vendor Category System](#6-vendor-category-system)
7. [Technical Architecture](#7-technical-architecture)
8. [Database Schema](#8-database-schema)
9. [API Structure](#9-api-structure)
10. [Search & Discovery Engine](#10-search--discovery-engine)
11. [Payment & Commission Model](#11-payment--commission-model)
12. [Development Phases](#12-development-phases)
13. [Tech Stack Summary](#13-tech-stack-summary)
14. [Non-Functional Requirements](#14-non-functional-requirements)
15. [Future Roadmap](#15-future-roadmap)

---

## 1. Product Vision

**VendorMap** is the most trusted digital bridge between local vendors and customers across Nigeria — enabling anyone to find, compare, and transact with nearby sellers of any goods or services through a single, intuitive platform.

Unlike formal e-commerce platforms such as Jumia or Konga, VendorMap is built specifically for the informal and semi-formal economy that drives the majority of real commerce in Nigerian cities. A vendor selling gullisuwa by the roadside in Kaduna, a tailor running a home shop in Kano, or a welding workshop in Zaria can all list on VendorMap exactly as they operate — in their own language, with their own item names, and with flexible pricing that reflects how they actually sell.

---

## 2. The Problem We Are Solving

### For customers
- Discovering local vendors is still largely word-of-mouth
- No way to compare prices across multiple vendors for the same item
- No visibility into which vendor is closest or has the best reputation
- No direct communication channel without physically visiting a vendor

### For vendors
- No affordable digital presence for informal sellers
- No tool to reach customers beyond their immediate neighbourhood
- No way to showcase products with photos and pricing
- No order management or revenue tracking

### The gap
International platforms require formal business registration, standard product catalogues, and English-language listings. They do not accommodate tuwan madara, gullisuwa, kosai, wara, or any of the thousands of locally named goods and services that make up the Nigerian informal economy. VendorMap is built to fill this gap.

---

## 3. Target Market

### Primary geography
Kaduna State (launch), expanding to other Northern Nigerian cities, then nationwide.

### Primary users

| Segment | Description |
|---|---|
| Street food vendors | Selling ready-made food and drinks at fixed or mobile locations |
| Fresh produce sellers | Market stalls and roadside farmers selling directly to consumers |
| Artisans and tradespeople | Tailors, cobblers, welders, mechanics, barbers, henna artists |
| Household goods sellers | Firewood, kerosene, clay pots, straw goods, sachet water |
| Service providers | Lesson teachers, photographers, drivers, cleaning services |
| Semi-formal shops | Small retail shops, pharmacies, hardware stores without online presence |

### Market insight
Nigeria's informal economy accounts for over 50% of GDP. The majority of daily consumer transactions happen between individuals and small vendors who have no digital footprint. VendorMap digitises this layer without requiring vendors to change how they operate.

---

## 4. Core User Roles

### Customer
- Registers with phone number or email
- Searches for items or services by keyword, category, or location
- Views vendor listings on map and in list view
- Compares prices across vendors
- Places orders and tracks status
- Chats directly with vendors
- Leaves ratings and reviews after purchase

### Vendor
- Registers business profile with name, category, location, and operating hours
- Uploads product or service listings with photos, descriptions, and pricing
- Receives and manages incoming orders
- Communicates with customers via in-app chat
- Tracks earnings and commission deductions
- Responds to reviews

### Admin
- Approves or suspends vendor accounts
- Manages platform-wide categories and synonym/alias mappings
- Sets and adjusts commission rates
- Resolves disputes between customers and vendors
- Views platform analytics and revenue reports
- Processes or schedules vendor payouts

---

## 5. Key Features

### 5.1 Intelligent search
- Full-text search across item names, descriptions, and vendor-defined tags
- Multilingual support: Hausa, English, and common transliterations are treated as equivalent
- Synonym/alias mapping maintained by admin (e.g. "tuwo" matches "tuwon shinkafa", "swallows", "tuwon rice")
- Fuzzy matching for misspellings and dialect variations
- Autocomplete suggestions as the customer types
- Filter by category, distance radius, price range, rating, and availability

### 5.2 Map-based vendor discovery
- Interactive map powered by Google Maps API (Leaflet.js with OpenStreetMap as fallback)
- Vendor pins drawn from GPS coordinates stored in the database
- Popup card on pin click showing vendor name, top item, rating, and distance
- "Get directions" link opens native maps navigation
- Cluster pins at high density zoom levels

### 5.3 Price comparison
- Side-by-side listing of all vendors stocking the searched item
- Sort by price (lowest first), distance (nearest first), or rating (highest first)
- Visual badges: "Cheapest nearby", "Closest to you", "Highest rated"
- Price range display for vendors using variable pricing

### 5.4 Flexible pricing modes
Because local goods are not always sold at fixed prices, every listing supports one of four pricing modes:

| Mode | Description | Example |
|---|---|---|
| Fixed price | Exact amount per unit | ₦500 per plate |
| Price range | Min and max | ₦200 – ₦500 per wrap |
| Price per unit | Amount with selectable unit | ₦800 per kg |
| Ask vendor | No price shown, customer initiates chat | Negotiable |

### 5.5 In-app messaging
- Direct chat thread between customer and vendor per order or enquiry
- Real-time delivery via WebSocket (Laravel Reverb)
- Image attachments supported
- New message push notifications
- Chat history persists per conversation thread

### 5.6 Order placement and tracking
- Customer adds item to cart and proceeds to checkout
- Order confirmed after payment is captured
- Status lifecycle: Pending → Confirmed → Preparing → Ready / Dispatched → Completed → (Disputed)
- Vendor updates status from their dashboard
- Customer receives notification at each status change

### 5.7 Ratings and reviews
- Star rating from 1 to 5 after a completed order
- Optional written review with photo upload
- Verified purchase badge on reviews from actual buyers
- Vendor can post a public reply to any review
- Overall vendor rating displayed on profile and map pin

### 5.8 Commission-based monetisation
- Platform deducts a configurable commission percentage from every completed transaction
- Commission is taken at payment capture before funds reach the vendor wallet
- Vendor sees net amount (after commission) in their dashboard
- Payouts processed on a weekly or on-demand basis to Nigerian bank accounts via Paystack or Flutterwave

---

## 6. Vendor Category System

VendorMap uses a flexible, open-ended category system. Vendors are assigned a broad category at registration, but their individual listings can use any item name they choose.

### Top-level categories

| Category | Examples |
|---|---|
| Street food and drinks | Gullisuwa, tuwan madara, kosai, danwake, kunu, zobo, suya, tsire, fura da nono, masa, alkaki |
| Fresh produce and farm goods | Tomatoes, onions, pepper, yam, cassava, vegetables, groundnuts, maize, guinea corn, dabino |
| Dairy and animal products | Wara (local cheese), nono (yoghurt), madara (fresh milk), eggs, smoked fish, beef |
| Clothing and fabric | Ankara, atamfa, guinea brocade, lace, babbar riga, kaftan, used clothing, hijab materials |
| Repairs and trades | Phone repair, welding, cobbler, motorcycle mechanic, keke repairs, generator service |
| Personal services | Tailoring, hair braiding, barbing, henna/lalle, laundry, photography |
| Household and supplies | Firewood, charcoal, kerosene, gas cylinders, calabash, clay pots, sachet water |
| Education and skills | Lesson teachers, Qur'an teaching, computer training, sewing school, Arabic lessons, driving school |
| General retail | Hardware, cosmetics, spare parts, stationery, mobile accessories |

### Tag and alias system
- Every listing has a `tags` field (comma-separated or JSON array)
- Admin maintains a `synonyms` table mapping search terms to canonical tags
- This allows a customer searching "swallows", "tuwo", or "tuwon shinkafa" to reach the same vendors

---

## 7. Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                    │
│         Vite · TailwindCSS · React Query            │
│    Customer App   |   Vendor Dashboard   |  Admin   │
└──────────────────────────┬──────────────────────────┘
                           │ HTTPS / REST API
┌──────────────────────────▼──────────────────────────┐
│               Laravel 11 API Backend                │
│   Sanctum Auth · RESTful Routes · Jobs & Queues     │
│   Events & Broadcasting · Notifications             │
└──────┬───────────────────┬────────────────┬─────────┘
       │                   │                │
┌──────▼──────┐   ┌────────▼──────┐  ┌──────▼──────┐
│   MySQL     │   │    Redis      │  │  File Store  │
│  (Spatial   │   │  Cache, Queue │  │  S3 / Local  │
│   Index)    │   │  Sessions     │  │  (Images)    │
└─────────────┘   └───────────────┘  └─────────────┘
       │
┌──────▼──────────────────────────────────────────────┐
│               External Services                     │
│  Paystack / Flutterwave  ·  Google Maps API         │
│  Termii SMS  ·  Africa's Talking  ·  Laravel Reverb │
└─────────────────────────────────────────────────────┘
```

### Frontend (React)
- **Vite** for build tooling
- **React Query (TanStack Query)** for server state management and caching
- **TailwindCSS** for utility-first styling
- **Leaflet.js** or **Google Maps JavaScript API** for the map view
- **Axios** for HTTP client
- **Zustand** for lightweight global UI state (cart, auth)
- **React Router v6** for client-side routing

### Backend (Laravel 11)
- **Laravel Sanctum** for API token authentication (SPA + mobile)
- **Laravel Reverb** for WebSocket broadcasting (real-time chat, notifications)
- **Laravel Queues** with Redis driver for background jobs (emails, SMS, payouts)
- **Laravel Scout** (optional) for abstracted full-text search
- **Spatie Laravel Permission** for role-based access control
- **Laravel Storage** with S3 driver for image uploads

### Database (MySQL)
- MySQL 8.0+ with spatial extension enabled
- Vendor coordinates stored as `POINT` geometry with `SPATIAL INDEX`
- `ST_Distance_Sphere()` used for radius-based queries
- Redis for query result caching, session storage, and queue backend

---

## 8. Database Schema

### users
```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
name            VARCHAR(255)
email           VARCHAR(255) UNIQUE NULLABLE
phone           VARCHAR(20) UNIQUE NULLABLE
password        VARCHAR(255)
role            ENUM('customer', 'vendor', 'admin') DEFAULT 'customer'
email_verified_at TIMESTAMP NULLABLE
phone_verified_at TIMESTAMP NULLABLE
avatar          VARCHAR(255) NULLABLE
is_active       BOOLEAN DEFAULT TRUE
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### vendor_profiles
```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
user_id         BIGINT UNSIGNED FK → users.id
business_name   VARCHAR(255)
description     TEXT NULLABLE
category_id     BIGINT UNSIGNED FK → categories.id
address         TEXT
city            VARCHAR(100)
state           VARCHAR(100)
coordinates     POINT NOT NULL   -- SPATIAL INDEX
operating_hours JSON NULLABLE    -- { mon: {open:'08:00', close:'18:00'}, ... }
logo            VARCHAR(255) NULLABLE
banner          VARCHAR(255) NULLABLE
is_approved     BOOLEAN DEFAULT FALSE
is_open         BOOLEAN DEFAULT TRUE
rating_avg      DECIMAL(3,2) DEFAULT 0.00
rating_count    INT DEFAULT 0
created_at      TIMESTAMP
updated_at      TIMESTAMP

SPATIAL INDEX (coordinates)
```

### categories
```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
name            VARCHAR(100)
slug            VARCHAR(100) UNIQUE
icon            VARCHAR(50) NULLABLE   -- Tabler icon name
parent_id       BIGINT UNSIGNED NULLABLE FK → categories.id
sort_order      INT DEFAULT 0
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### listings
```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
vendor_id       BIGINT UNSIGNED FK → vendor_profiles.id
category_id     BIGINT UNSIGNED FK → categories.id
name            VARCHAR(255)       -- vendor's own item name, any language
slug            VARCHAR(255)
description     TEXT NULLABLE
pricing_mode    ENUM('fixed','range','per_unit','ask') DEFAULT 'fixed'
price           DECIMAL(12,2) NULLABLE
price_min       DECIMAL(12,2) NULLABLE
price_max       DECIMAL(12,2) NULLABLE
price_unit      VARCHAR(50) NULLABLE   -- 'kg', 'plate', 'wrap', 'session', etc.
currency        VARCHAR(10) DEFAULT 'NGN'
is_available    BOOLEAN DEFAULT TRUE
is_featured     BOOLEAN DEFAULT FALSE
tags            JSON NULLABLE          -- ["street food","breakfast","Hausa food"]
images          JSON NULLABLE          -- array of image paths
created_at      TIMESTAMP
updated_at      TIMESTAMP

FULLTEXT INDEX (name, description)
```

### search_synonyms
```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
search_term     VARCHAR(255)    -- what the customer types
canonical_tag   VARCHAR(255)    -- the tag to search for
language        VARCHAR(20) DEFAULT 'any'
created_at      TIMESTAMP
updated_at      TIMESTAMP

INDEX (search_term)
```

### orders
```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
reference       VARCHAR(50) UNIQUE    -- e.g. VM-20240601-00345
customer_id     BIGINT UNSIGNED FK → users.id
vendor_id       BIGINT UNSIGNED FK → vendor_profiles.id
status          ENUM('pending','confirmed','preparing','ready','dispatched','completed','cancelled','disputed')
subtotal        DECIMAL(12,2)
commission_rate DECIMAL(5,2)          -- snapshot of rate at time of order
commission_amt  DECIMAL(12,2)
vendor_payout   DECIMAL(12,2)         -- subtotal - commission_amt
notes           TEXT NULLABLE
delivery_type   ENUM('pickup','delivery') DEFAULT 'pickup'
delivery_address TEXT NULLABLE
completed_at    TIMESTAMP NULLABLE
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### order_items
```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
order_id        BIGINT UNSIGNED FK → orders.id
listing_id      BIGINT UNSIGNED FK → listings.id
listing_name    VARCHAR(255)          -- snapshot in case listing is deleted
quantity        DECIMAL(10,3)         -- supports fractional (e.g. 0.5 kg)
unit            VARCHAR(50) NULLABLE
unit_price      DECIMAL(12,2)
subtotal        DECIMAL(12,2)
created_at      TIMESTAMP
```

### payments
```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
order_id        BIGINT UNSIGNED FK → orders.id
gateway         ENUM('paystack','flutterwave','manual')
gateway_ref     VARCHAR(255) NULLABLE
amount          DECIMAL(12,2)
currency        VARCHAR(10) DEFAULT 'NGN'
status          ENUM('pending','success','failed','refunded')
paid_at         TIMESTAMP NULLABLE
meta            JSON NULLABLE          -- gateway webhook payload
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### conversations
```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
customer_id     BIGINT UNSIGNED FK → users.id
vendor_id       BIGINT UNSIGNED FK → vendor_profiles.id
order_id        BIGINT UNSIGNED NULLABLE FK → orders.id
last_message_at TIMESTAMP NULLABLE
created_at      TIMESTAMP
updated_at      TIMESTAMP

UNIQUE INDEX (customer_id, vendor_id)
```

### messages
```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
conversation_id BIGINT UNSIGNED FK → conversations.id
sender_id       BIGINT UNSIGNED FK → users.id
body            TEXT NULLABLE
attachment      VARCHAR(255) NULLABLE
is_read         BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### reviews
```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
order_id        BIGINT UNSIGNED UNIQUE FK → orders.id
customer_id     BIGINT UNSIGNED FK → users.id
vendor_id       BIGINT UNSIGNED FK → vendor_profiles.id
rating          TINYINT            -- 1 to 5
body            TEXT NULLABLE
images          JSON NULLABLE
vendor_reply    TEXT NULLABLE
vendor_replied_at TIMESTAMP NULLABLE
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### vendor_payouts
```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
vendor_id       BIGINT UNSIGNED FK → vendor_profiles.id
amount          DECIMAL(12,2)
bank_name       VARCHAR(100)
account_number  VARCHAR(20)
account_name    VARCHAR(255)
gateway         ENUM('paystack','flutterwave','manual')
gateway_ref     VARCHAR(255) NULLABLE
status          ENUM('pending','processing','paid','failed')
processed_at    TIMESTAMP NULLABLE
notes           TEXT NULLABLE
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 9. API Structure

All endpoints are prefixed with `/api/v1`.

### Authentication
```
POST   /auth/register/customer
POST   /auth/register/vendor
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
POST   /auth/verify/phone
GET    /auth/me
```

### Vendors (public)
```
GET    /vendors                         -- paginated list with filters
GET    /vendors/{slug}                  -- vendor public profile
GET    /vendors/{slug}/listings         -- vendor's listings
GET    /vendors/{slug}/reviews          -- vendor's reviews
GET    /vendors/map                     -- vendors within radius for map pins
                                        -- query: lat, lng, radius_km, q
```

### Listings (public)
```
GET    /listings                        -- search & filter
                                        -- query: q, category, lat, lng, radius_km,
                                        --        price_min, price_max, sort
GET    /listings/{id}                   -- single listing detail
```

### Vendor dashboard (authenticated, vendor role)
```
GET    /vendor/profile
PUT    /vendor/profile
GET    /vendor/listings
POST   /vendor/listings
PUT    /vendor/listings/{id}
DELETE /vendor/listings/{id}
GET    /vendor/orders
PUT    /vendor/orders/{id}/status
GET    /vendor/analytics
GET    /vendor/payouts
POST   /vendor/payouts/request
```

### Customer (authenticated, customer role)
```
GET    /customer/orders
POST   /customer/orders
GET    /customer/orders/{id}
POST   /customer/reviews
GET    /customer/wishlist
POST   /customer/wishlist/{listing_id}
DELETE /customer/wishlist/{listing_id}
```

### Messaging
```
GET    /conversations
GET    /conversations/{id}/messages
POST   /conversations/{id}/messages
POST   /conversations                  -- start new conversation
```

### Checkout and payments
```
POST   /checkout/initiate              -- returns Paystack/Flutterwave redirect URL
POST   /payments/webhook/paystack      -- webhook endpoint (no auth)
POST   /payments/webhook/flutterwave   -- webhook endpoint (no auth)
```

### Admin (authenticated, admin role)
```
GET    /admin/vendors/pending
PUT    /admin/vendors/{id}/approve
PUT    /admin/vendors/{id}/suspend
GET    /admin/orders
GET    /admin/payouts/pending
PUT    /admin/payouts/{id}/process
GET    /admin/analytics/overview
GET    /admin/synonyms
POST   /admin/synonyms
DELETE /admin/synonyms/{id}
```

---

## 10. Search & Discovery Engine

### Search query flow

```
Customer types: "tuwan madara"
        │
        ▼
1. Normalise: lowercase, trim, remove diacritics
        │
        ▼
2. Synonym lookup in search_synonyms table
   "tuwan madara" → canonical tags: ["tuwo", "swallow", "local food"]
        │
        ▼
3. Full-text search on listings.name + listings.description
   MATCH AGAINST ('tuwan madara tuwo swallow local food') IN BOOLEAN MODE
        │
        ▼
4. Tag match: listings where tags JSON contains any of the canonical tags
        │
        ▼
5. Merge results (UNION), deduplicate by listing ID
        │
        ▼
6. Apply filters: radius, category, price range, is_available = TRUE
        │
        ▼
7. Sort: by relevance score (default), or price, distance, rating
        │
        ▼
8. Attach vendor coordinates → return to React for map rendering
```

### Radius query (MySQL spatial)

```sql
SELECT
  vp.id,
  vp.business_name,
  ST_Distance_Sphere(vp.coordinates, POINT(?, ?)) / 1000 AS distance_km,
  vp.rating_avg
FROM vendor_profiles vp
WHERE
  ST_Distance_Sphere(vp.coordinates, POINT(?, ?)) <= ? * 1000  -- radius in metres
  AND vp.is_approved = TRUE
  AND vp.is_active = TRUE
ORDER BY distance_km ASC;
-- Parameters: [customer_lng, customer_lat, customer_lng, customer_lat, radius_km]
```

### Caching strategy (Redis)

| Key pattern | TTL | Contents |
|---|---|---|
| `search:{hash_of_query}` | 5 min | Search result IDs |
| `vendor:map:{lat}:{lng}:{radius}` | 2 min | Map pin data |
| `listing:{id}` | 10 min | Full listing detail |
| `vendor:{slug}` | 10 min | Vendor public profile |
| `categories:all` | 1 hour | Full category tree |
| `synonyms:all` | 1 hour | All synonym mappings |

Cache is invalidated on write (vendor updates listing, admin edits synonym, etc.).

---

## 11. Payment & Commission Model

### Flow

```
Customer pays ₦2,000 for an order
        │
        ▼
Paystack/Flutterwave captures full ₦2,000
        │
        ▼
Webhook fires → Laravel marks payment as successful
        │
        ▼
Commission calculated:
  ₦2,000 × 10% = ₦200 (platform commission)
  ₦2,000 − ₦200 = ₦1,800 (vendor payout amount)
        │
        ▼
Order status → Confirmed
Vendor wallet balance +₦1,800
Platform revenue ledger +₦200
        │
        ▼
On payout request (or scheduled):
  Paystack Transfer API → vendor bank account ₦1,800
```

### Commission configuration

The `commission_rate` field on each order is a snapshot of the rate at time of purchase. The admin can adjust the platform-wide default rate, apply category-level rates (e.g. food = 8%, services = 12%), or set vendor-specific rates for high-volume partners.

### Pricing gateway selection

| Gateway | Use case |
|---|---|
| Paystack | Default. Best Nigerian bank coverage, easy transfer API |
| Flutterwave | Fallback, good for cross-border as platform expands |
| Manual | Admin-entered bank transfer for dispute resolutions |

---

## 12. Development Phases

### Phase 1 — Foundation and core auth (Weeks 1–4)

**Goal:** Working authentication for all three roles, vendor profile creation, and product/service listing CRUD.

**Deliverables:**
- Laravel 11 project scaffold with Docker development environment
- MySQL schema with all core tables and migrations
- React frontend scaffold with Vite and TailwindCSS
- Customer and vendor registration and login flows (Sanctum)
- Admin base panel with role guards
- Vendor profile form: business name, category, GPS location capture, operating hours
- Product/service listing CRUD: name, description, pricing mode, images, tags
- Image upload to S3/local storage

**Tech used:** Laravel 11, Sanctum, Spatie Permission, React 18, Vite, TailwindCSS, MySQL 8, Docker, AWS S3

---

### Phase 2 — Search, map, and price comparison (Weeks 5–9)

**Goal:** Customer can search an item, see all matching vendors on a map and price-ranked list, view ratings, and get directions.

**Deliverables:**
- Full-text search with synonym resolution and fuzzy matching
- Radius-based vendor filtering using MySQL spatial index
- Google Maps / Leaflet.js map view with vendor pins and popup cards
- Price comparison list view with sort and filter controls
- Vendor public profile page
- Ratings and reviews system (post-purchase only)
- Search result caching via Redis

**Tech used:** MySQL spatial (POINT, ST_Distance_Sphere), Google Maps API, Leaflet.js, Redis, Laravel Scout (optional)

---

### Phase 3 — Orders, payments, and messaging (Weeks 10–15)

**Goal:** End-to-end order placement, commission-aware payment processing, real-time vendor-customer chat, and multi-channel notifications.

**Deliverables:**
- Shopping cart and checkout flow
- Paystack integration: payment initiation and webhook handling
- Commission calculation and vendor wallet balance
- Order status lifecycle and vendor order dashboard
- Real-time in-app messaging (Laravel Reverb / WebSocket)
- Push notifications: order status, new messages
- Email notifications via Laravel Mail (Mailgun or SMTP)
- SMS notifications via Termii or Africa's Talking

**Tech used:** Paystack API, Laravel Reverb, Pusher (fallback), Laravel Queues (Redis driver), Laravel Mail, Termii SMS

---

### Phase 4 — Admin, analytics, and launch (Weeks 16–20)

**Goal:** Full admin control panel, revenue analytics, mobile-optimized PWA, and a production-ready deployment pipeline.

**Deliverables:**
- Admin panel: vendor approval, suspension, dispute resolution
- Commission rate management (global, per category, per vendor)
- Vendor payout processing dashboard
- Platform analytics: GMV, order volume, active vendors, top searches
- Vendor performance dashboard
- Progressive Web App (PWA) setup with service worker and install prompt
- Mobile UI polish and responsive audit
- CI/CD pipeline (GitHub Actions → production server)
- SSL, Nginx configuration, environment hardening
- Load testing and performance optimisation
- SEO meta tags and sitemap

**Tech used:** Recharts/Chart.js, GitHub Actions, Nginx, Let's Encrypt, Laravel Telescope, Workbox (PWA)

---

## 13. Tech Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| Frontend framework | React 18 + Vite | SPA with fast HMR |
| UI styling | TailwindCSS | Utility-first responsive design |
| State management | React Query + Zustand | Server state + UI state |
| Map | Google Maps API / Leaflet.js | Vendor location display |
| HTTP client | Axios | API communication |
| Backend framework | Laravel 11 | API, business logic, queues |
| Authentication | Laravel Sanctum | Token-based auth for SPA |
| Authorisation | Spatie Permission | Role and permission management |
| Real-time | Laravel Reverb | WebSocket for chat and notifications |
| Database | MySQL 8.0+ | Primary data store with spatial support |
| Cache / Queue | Redis | Search caching, background jobs |
| File storage | AWS S3 / local | Image uploads |
| Payments | Paystack + Flutterwave | Payments and vendor payouts |
| SMS | Termii / Africa's Talking | Order and auth SMS notifications |
| Email | Laravel Mail (Mailgun/SMTP) | Transactional emails |
| Deployment | Nginx + Let's Encrypt | Web server and SSL |
| CI/CD | GitHub Actions | Automated deploy pipeline |
| Monitoring | Laravel Telescope | Request, query, job monitoring |
| Search | MySQL FULLTEXT + Scout | Text and spatial search |

---

## 14. Non-Functional Requirements

### Performance
- Search results must return within 500ms for queries with cache miss
- Map pins must load within 1 second for up to 500 vendors in radius
- API p95 response time target: under 300ms
- Frontend initial load: under 3 seconds on 3G connection

### Scalability
- Database designed for horizontal read scaling via read replicas
- Redis caching absorbs high-frequency search traffic
- Queue workers can be scaled independently of web workers
- Spatial index handles up to 100,000 vendor records without degradation

### Security
- All API routes protected by CSRF and rate limiting
- File uploads validated for type and size server-side
- Payment webhook endpoints verified with gateway signatures
- Vendor coordinates validated to Nigerian geographic bounds at input
- Admin actions logged to audit trail

### Availability
- Target 99.5% uptime
- Health check endpoint at `/api/health`
- Database automated backups daily
- Vendor data never hard-deleted (soft delete with `deleted_at`)

### Accessibility
- WCAG 2.1 AA compliance for the customer-facing frontend
- All images have alt text
- Colour contrast ratios meet minimum standards
- Keyboard navigation supported throughout

---

## 15. Future Roadmap

These features are deliberately out of scope for the initial launch but are planned for future iterations.

| Feature | Description |
|---|---|
| Native mobile apps | React Native apps for iOS and Android using the same API |
| Delivery integration | Integration with local dispatch riders or in-house delivery tracking |
| Vendor subscription tier | Optional paid tier with featured placement and analytics |
| Group buying | Multiple customers pool orders from the same vendor for bulk pricing |
| AI-powered recommendations | Personalised item suggestions based on search and order history |
| Hausa-language UI | Full Hausa interface option for vendors and customers |
| Multi-city expansion | City-by-city rollout with city-specific landing pages |
| Vendor inventory alerts | Low stock notifications and automatic availability toggling |
| Loyalty programme | Customer points system redeemable against future orders |
| B2B ordering | Bulk ordering for restaurants, canteens, and institutions buying from produce vendors |

---

*Document version 1.0 — prepared for VendorMap project planning*
*Stack: Laravel 11 · React 18 · MySQL 8 · Redis · Paystack · Google Maps API*
