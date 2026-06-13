<div align="center">

<img src="https://img.shields.io/badge/Laravel-13-FF2D20?style=for-the-badge&logo=laravel&logoColor=white"/>
<img src="https://img.shields.io/badge/Flutter-3.x-02569B?style=for-the-badge&logo=flutter&logoColor=white"/>
<img src="https://img.shields.io/badge/Paystack-NGN-00C3F7?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Deriv-IB_Partner-FF444F?style=for-the-badge"/>
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"/>

# TradeFi NG

**Nigeria's forex & CFD introducing-broker platform.**  
Trade global markets. Pay in Naira. Earn in Dollars.

[Features](#features) · [Tech Stack](#tech-stack) · [Quick Start](#quick-start) · [Architecture](#architecture) · [Mobile App](#mobile-app) · [Deployment](#deployment) · [Contributing](#contributing)

</div>

---

## Overview

TradeFi NG is a full-stack introducing broker (IB) platform built for the Nigerian retail trading market. It provides a branded trading interface on top of a regulated partner broker (Deriv), handling NGN deposits and withdrawals via Paystack, a 3-level IB commission tree, KYC verification, and real-time price feeds over WebSocket.

The platform operates as an **Introducing Broker** — user accounts and commissions are tracked on TradeFi NG, while actual trade execution happens through the regulated partner broker infrastructure.

---

## Features

### Trading
- Live forex, metals, crypto, and indices — 40+ instruments
- Real-time bid/ask prices via WebSocket (Laravel Reverb)
- Place and close trades with stop-loss and take-profit
- Open positions and full trade history
- Demo accounts with virtual funds

### Payments (NGN)
- Deposit via any Nigerian bank account using Paystack
- Withdrawal to Nigerian bank account (admin-approved)
- Automatic NGN ↔ USD conversion at live exchange rate
- Paystack webhook processing (idempotent, race-condition safe)

### IB Commission System
- 3-level referral tree (Level 1: $3/lot · Level 2: $1.50/lot · Level 3: $0.50/lot)
- Commission calculated automatically on every closed trade
- IB wallet credited in real time
- Sub-IB registration and tree visualisation

### KYC & Compliance
- Document upload (NIN, driver's license, passport, utility bill, selfie)
- Admin review and approve/reject workflow
- Email verification gate before trading
- Full AML compliance disclaimer

### Security
- Laravel Sanctum API token authentication
- TOTP two-factor authentication (Google Authenticator)
- KYC verification required before live trading
- Withdrawal admin approval workflow
- Rate limiting on deposit and withdrawal endpoints
- `lockForUpdate()` database locks preventing double-spend race conditions

### Admin Panel
- Full user management (suspend, verify, role assignment)
- KYC document review with approve/reject
- Withdrawal approval queue
- IB tree management and per-IB commission rate override
- Platform revenue dashboard (deposit fees, IB spread, subscriptions)
- Volume and commission reports

### Internationalisation
- Hausa and English language support
- Language toggle in UI and user preference stored per account

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Laravel 13 (PHP 8.3) |
| **Database** | SQLite (development) · MySQL/PostgreSQL (production) |
| **Cache / Queue** | Redis |
| **WebSocket** | Laravel Reverb |
| **Frontend** | Blade templates · Vanilla JS · Chart.js |
| **Payments** | Paystack (NGN deposits & bank transfers) |
| **Broker integration** | Mock (dev) · MT5 Manager API · Deriv WebSocket API |
| **Admin panel** | Filament v3 |
| **Mobile** | Flutter 3.x (see [Mobile App](#mobile-app)) |
| **Auth** | Laravel Sanctum · pragmarx/google2fa |

---

## Quick Start

### Requirements

- PHP 8.2+
- Composer 2.x
- Node.js 20+
- SQLite (dev) or MySQL 8+ (production)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/AYHHamsuky/Trade_Fi_NG.git
cd Trade_Fi_NG/broker-platform

# 2. Install all dependencies and set up the environment
composer run setup

# 3. Seed the database
php artisan db:seed

# 4. Start the development server
composer run dev
```

`composer run dev` starts four processes concurrently:
- `php artisan serve` — Laravel app on `:8000`
- `php artisan queue:listen` — queue worker
- `php artisan pail` — log viewer
- `npm run dev` — Vite asset bundler

Open **http://127.0.0.1:8000**

### Real-time prices

Run these in two extra terminals to see live prices stream over WebSocket:

```bash
# Terminal A — WebSocket server
php artisan reverb:start

# Terminal B — price simulation broadcast
php artisan broker:simulate-prices --ticks=100000
```

### Running tests

```bash
composer run test
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Users                           │
│         Traders · IBs · Admin                       │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│              Flutter App (mobile)                   │
│         iOS · Android · Hausa/English               │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS API
┌──────────────────▼──────────────────────────────────┐
│               Laravel Backend                       │
│   Auth · KYC · Wallet · Trading · IB Engine        │
│   Paystack · Exchange Rate · Notifications          │
└──────┬─────────────────────────┬────────────────────┘
       │                         │
┌──────▼──────┐         ┌────────▼────────┐
│   MySQL     │         │  Laravel Reverb │
│   + Redis   │         │  (WebSocket)    │
└─────────────┘         └─────────────────┘
       │
┌──────▼──────────────────────────────────────────────┐
│              Partner Broker                         │
│   Mock (dev) · MT5 Manager API · Deriv WS API      │
│   Liquidity · Execution · Account management       │
└─────────────────────────────────────────────────────┘
```

### Module map

| Module | Key files |
|---|---|
| Auth | `RegisterController` · `LoginController` · `TwoFactorController` |
| KYC | `KYCController` · `KYCService` · `KYCDocument` model |
| Trading | `TradingService` · `TradeController` · `PositionController` |
| Wallet | `WalletService` · `DepositController` · `WithdrawalController` |
| IB Engine | `IBCommissionService` · `IBController` · `ReferralController` |
| Price Feed | `PriceFeedService` · `PriceFeedUpdated` event · `SimulatePrices` command |
| Broker drivers | `BrokerServiceInterface` · `MockBrokerService` · `MT5Service` · `DerivService` |
| Admin | `UserManagementController` · `KYCReviewController` · `WithdrawalApprovalController` |
| Sync | `SyncBrokerTrades` command · `RefreshExchangeRate` command |
| Revenue | `PlatformRevenue` model · deposit fee · withdrawal fee recording |

### Database tables (16)

```
users                 trading_accounts      trades
wallets               deposits              withdrawals
ib_relationships      ib_commissions        kyc_documents
instruments           platform_revenue      jobs
cache                 sessions              failed_jobs
personal_access_tokens
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values relevant to your environment.

```bash
cp .env.example .env
php artisan key:generate
```

### Broker driver

```env
# Switch between: mock | mt5 | deriv
BROKER_TYPE=mock
```

`mock` mode runs the full platform with no external broker connection — useful for development and demos.

### Paystack

```env
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_MOCK=false          # set true in dev to skip real Paystack calls
```

### Deriv IB Partner

```env
DERIV_PARTNER_URL=https://partner-tracking.deriv.com/click?...
DERIV_PARTNER_CODE=your_code_here
```

### MT5 (when BROKER_TYPE=mt5)

```env
MT5_API_URL=
MT5_MANAGER_LOGIN=
MT5_MANAGER_PASSWORD=
MT5_SERVER=
```

### Deriv API (when BROKER_TYPE=deriv)

```env
DERIV_APP_ID=
DERIV_API_TOKEN=
```

### Reverb WebSocket

```env
REVERB_APP_ID=
REVERB_APP_KEY=
REVERB_APP_SECRET=
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
```

### Exchange rate

```env
USD_NGN_RATE=1583.40         # fallback — refreshed hourly via fx:refresh-rate command
```

---

## Scheduled Commands

Add to your server crontab:

```bash
* * * * * cd /path/to/broker-platform && php artisan schedule:run >> /dev/null 2>&1
```

| Command | Schedule | Purpose |
|---|---|---|
| `broker:sync-trades` | Every minute | Pull closed trades from broker, trigger IB commissions |
| `fx:refresh-rate` | Hourly | Refresh USD/NGN exchange rate from live API |
| `broker:simulate-prices` | Manual (dev only) | Broadcast simulated price ticks via WebSocket |

---

## Production Deployment

### Server requirements

- Ubuntu 22.04+
- Nginx
- PHP 8.3-FPM
- MySQL 8+ or PostgreSQL 15+
- Redis 7+
- Supervisor (for queue workers and Reverb)

### Nginx config (summary)

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    root /var/www/broker-platform/public;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location /app {
        proxy_pass         http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "Upgrade";
    }
}
```

### Supervisor workers

```ini
[program:tradefi-queue]
command=php artisan queue:work redis --queue=webhooks,default,low --tries=3 --sleep=3
directory=/var/www/broker-platform
numprocs=2
autostart=true
autorestart=true

[program:tradefi-reverb]
command=php artisan reverb:start --host=0.0.0.0 --port=8080
directory=/var/www/broker-platform
numprocs=1
autostart=true
autorestart=true
```

### Production checklist

```bash
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php artisan storage:link
npm run build
```

---

## Mobile App

The Flutter mobile app (iOS & Android) connects to this Laravel backend.

**Architecture doc:** `tradefi-ng-flutter-architecture.md`

### Mobile tech stack

| | |
|---|---|
| Framework | Flutter 3.x · Dart |
| State | Riverpod 2.x |
| Navigation | GoRouter |
| HTTP | Dio + Retrofit |
| WebSocket | web_socket_channel (Reverb) |
| Payments | paystack_flutter |
| Storage | Hive (cache) · flutter_secure_storage (token) |
| Notifications | Firebase FCM |
| i18n | Hausa + English |

### Mobile screens

```
Splash → Login / Register (with ?ref= IB deep link)
    ↓
Dashboard → account balance · open positions · recent trades
Markets   → live prices · candlestick chart · order book
Trade     → place/close trades · SL/TP · lot size stepper
Wallet    → NGN balance · Paystack deposit · bank withdrawal
KYC       → document upload · status tracking
IB        → commission summary · referral link · Deriv partner link · tree view
Profile   → settings · language · 2FA · logout
```

---

## API Reference

All endpoints require `Authorization: Bearer {token}` except public routes.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/register` | No | Register new user |
| POST | `/api/login` | No | Login and get token |
| GET | `/api/instruments` | No | List all instruments |
| GET | `/api/kyc/status` | Yes | Get KYC status |
| POST | `/api/kyc/submit` | Yes | Submit KYC documents |
| GET | `/api/accounts` | Yes + KYC | List trading accounts |
| POST | `/api/accounts` | Yes + KYC | Create trading account |
| POST | `/api/trades` | Yes + KYC | Open a trade |
| DELETE | `/api/trades/{id}` | Yes + KYC | Close a trade |
| GET | `/api/positions` | Yes + KYC | Open positions |
| GET | `/api/history` | Yes + KYC | Closed trade history |
| GET | `/api/wallet` | Yes | Wallet balance |
| POST | `/api/deposit/initiate` | Yes | Start Paystack deposit |
| GET | `/api/deposit/verify/{ref}` | Yes | Verify deposit |
| POST | `/api/withdraw` | Yes | Request withdrawal |
| GET | `/api/ib/dashboard` | Yes | IB stats |
| GET | `/api/ib/commissions` | Yes | Commission history |
| GET | `/api/ib/referral-link` | Yes | Get referral link |
| POST | `/api/webhooks/paystack` | No (sig) | Paystack webhook |

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

```bash
# Run tests before submitting
composer run test

# Check code style
./vendor/bin/pint --test
```

---

## Roadmap

- [x] Laravel backend with mock broker
- [x] Paystack NGN deposit and withdrawal
- [x] 3-level IB commission engine
- [x] KYC document upload and review
- [x] Real-time price feed via Reverb WebSocket
- [x] Deriv IB partner integration
- [x] Platform revenue tracking
- [ ] Flutter mobile app (iOS + Android)
- [ ] MT5 live broker connection
- [ ] Deriv WebSocket live broker connection
- [ ] Copy trading feature
- [ ] Signal subscription system
- [ ] Admin Filament panel
- [ ] Google Play Store release
- [ ] Apple App Store release

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Contact

**AYH Hamsuky Enterprises**  
CAC Registration: BN 8483128  
Kaduna, Nigeria

- Telegram: [@htechdev5](https://t.me/htechdev5)
- WhatsApp: [+234 813 380 5942](https://wa.me/2348133805942)
- GitHub: [AYHHamsuky](https://github.com/AYHHamsuky)

---

<div align="center">

**Built in Nigeria 🇳🇬 for Nigerian traders**

*TradeFi NG operates as an Introducing Broker in partnership with a regulated broker.  
Trading CFDs involves significant risk. 74% of retail investors lose money.*

</div>
