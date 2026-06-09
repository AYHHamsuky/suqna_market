#!/usr/bin/env bash
# Start the VendorMap API and web dev servers together.
set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "▶ Starting Laravel API on http://localhost:8000"
( cd "$ROOT/vendormap-api" && php artisan serve --host=127.0.0.1 --port=8000 ) &
API_PID=$!

echo "▶ Starting React web on http://localhost:5174"
( cd "$ROOT/vendormap-web" && npm run dev ) &
WEB_PID=$!

trap "echo; echo 'Stopping…'; kill $API_PID $WEB_PID 2>/dev/null" INT TERM
echo "✓ Both running. Open http://localhost:5174  (Ctrl+C to stop)"
wait
