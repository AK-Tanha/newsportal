#!/bin/bash
# Read-only live probe. Password NEVER echoed.
set -f
P="/Users/*"
[ -f ".env" ] || cd ..
ENV_DIR="$(pwd)"
LIVE_RAW=$(awk -F'=' '$1=="#DATABASE_URL" || $1=="#database_url"{print substr($0,index($0,"=")+1)}' .env | sed -n '1p')
LOG="$(pwd)/db-backups/live-probe3.log"; : >"$LOG"
{
echo "LOG_BEGIN"
echo "live_host_port=$(printf '%s' "$LIVE_RAW" | sed -E 's#.*@##; s#(:[0-9]+)/.*#\1#')"
echo "live_host=$(printf '%s' "$LIVE_RAW" | sed -E 's#.*@##; s#:[0-9]+/.*##')"
echo "--- tcp ---"
nc -z -G 8 "$(printf '%s' "$LIVE_RAW" | sed -E 's#.*@##; s#:[0-9]+/.*##')" "$(printf '%s' "$LIVE_RAW" | sed -E 's#.*:([0-9]+)/.*#\1#')" 2>&1 && echo "TCP_OPEN" || echo "TCP_CLOSED"
echo "--- version ---"
PGCONNECT_TIMEOUT=10 psql "$LIVE_RAW" -X -tAc "SELECT version();" 2>&1 | sed -E 's/ on / on /' 
echo "--- identity ---"
PGCONNECT_TIMEOUT=10 psql "$LIVE_RAW" -X -tAc "SELECT current_user,current_database();" 2>&1
echo "--- tables ---"
PGCONNECT_TIMEOUT=10 psql "$LIVE_RAW" -X -tAc "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1;" 2>&1
echo "--- migrations ---"
PGCONNECT_TIMEOUT=10 psql "$LIVE_RAW" -X -tAc "SELECT id,name FROM migrations ORDER BY id;" 2>&1
echo "--- counts ---"
PGCONNECT_TIMEOUT=10 psql "$LIVE_RAW" -X -tAc "
SELECT 'users='||count(*) FROM users UNION ALL
SELECT 'categories='||count(*) FROM categories UNION ALL
SELECT 'tags='||count(*) FROM tags UNION ALL
SELECT 'media='||count(*) FROM media UNION ALL
SELECT 'articles='||count(*) FROM articles UNION ALL
SELECT 'article_contents='||count(*) FROM article_contents UNION ALL
SELECT 'article_tags='||count(*) FROM article_tags UNION ALL
SELECT 'videos='||count(*) FROM videos UNION ALL
SELECT 'live_streams='||count(*) FROM live_streams UNION ALL
SELECT 'advertisements='||count(*) FROM advertisements UNION ALL
SELECT 'advertisement_placements='||count(*) FROM advertisement_placements UNION ALL
SELECT 'site_settings='||count(*) FROM site_settings UNION ALL
SELECT 'sessions='||count(*) FROM sessions;" 2>&1
echo "LOG_END"
} >>"$LOG" 2>&1
echo "probe3_bytes=$(wc -c <"$LOG")"
