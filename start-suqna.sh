#!/usr/bin/env bash
# Suqna — start both dev servers (Laravel API + React web) and keep them running.
# Usage:  ./start-suqna.sh        (Ctrl-C stops both)
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
API="$ROOT/vendormap-api"
WEB="$ROOT/vendormap-web"

echo "▶ Starting Suqna API   on http://0.0.0.0:8000 (reachable on your LAN for the mobile app)"
echo "▶ Starting Suqna web   on http://localhost:5174"
echo "  (demo logins — password: password)"
echo "    admin@suqna.ng · vendor@suqna.ng · customer@suqna.ng"
echo

# Stop both children when this script is interrupted
trap 'echo; echo "Stopping…"; kill 0' INT TERM EXIT

# Bind to 0.0.0.0 so the Flutter app on a phone/emulator can reach the API over Wi-Fi.
( cd "$API" && php artisan serve --host=0.0.0.0 --port=8000 ) &
( cd "$WEB" && npm run dev ) &

wait
