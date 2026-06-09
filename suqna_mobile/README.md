# Suqna Mobile

The customer mobile app for **Suqna** — find, compare and buy from local vendors near you.
Built with Flutter (Riverpod · go_router · Dio · flutter_map/OSM), styled to match the web app's
ember/gold light theme, and consuming the same Laravel API (`/api/v1`).

## Features
- **Auth** — login & customer registration (Sanctum token, persisted securely).
- **Discover** — home with categories + popular items, full search with filters
  (category, sort: cheapest/nearest/top-rated, *Near me* via GPS) and an **OpenStreetMap** view with vendor pins.
- **Listing detail** — image gallery, flexible pricing, quantity, add-to-cart, wishlist, chat-with-vendor, "more from vendor".
- **Vendor profile** — banner, rating, listings, reviews.
- **Cart & checkout** — single-vendor cart, pickup/delivery, mock (sandbox) Paystack flow.
- **Orders** — list, status timeline, pay-now, **reorder**, leave a review, message the vendor.
- **Messaging** — conversations + chat (polling) with a **new-message notification sound** 🔔
  (plays in the open chat *and* app-wide via a background unread poller; toggle in Profile → Settings).
- **Wishlist & profile/settings** — saved items, configurable API address, mute sound, sign out.

## Run it

1. **Start the backend** (from the repo root) so it's reachable on your LAN:
   ```bash
   ./start-suqna.sh        # API binds 0.0.0.0:8000
   ```

2. **Set the API address** for your target (Profile → Settings in-app, or edit `lib/core/config.dart`):

   | Target | API base URL |
   |---|---|
   | Physical phone (same Wi-Fi) | `http://<your-mac-LAN-IP>:8000/api/v1` (default: `http://10.66.181.19:8000/api/v1`) |
   | iOS simulator / macOS | `http://127.0.0.1:8000/api/v1` |
   | Android emulator | `http://10.0.2.2:8000/api/v1` |

3. **Launch the app:**
   ```bash
   cd suqna_mobile
   flutter pub get
   flutter run            # pick a device, or: flutter run -d macos
   ```

Demo login: `customer@suqna.ng` / `password`.

## Notes
- Cleartext HTTP is enabled for development (Android `usesCleartextTraffic`, iOS ATS, macOS network entitlement).
  For production, use HTTPS and tighten these.
- The notification sound asset lives at `assets/sounds/message.wav`.
- Push notifications while the app is backgrounded would require FCM (`firebase_messaging`) — not included;
  the current sound fires while the app is open (polling).
