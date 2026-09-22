#!/usr/bin/env bash
# Read-only: verify live server state. Password lives only in LIVEURL var never printed.
set +H
WA=$(ls -d /Users/*/workstations/newsportal/webapp | sed -n '1p')
OUTF="$WA/db-backups/live-final.log"
: > "$OUTF"
LIVEURL=$(sed -nE 's/^#[[:space:]]*DATABASE_URL=//p' "$WA/.env" | sed -n '1p')
{
echo "live_shown=$(printf '%s' "$LIVEURL" | sed -E 's#(postgresql://[^:]+:)[^@]+@#\1MASKED@#')"
echo "live_hostport=$(printf '%s' "$LIVEURL" | sed -E 's#postgresql://[^@]*@##; s#/.*##')"
echo "== version =="
PGCONNECT_TIMEOUT=30 psql "$LIVEURL" -X -tAc "SELECT version();" 2>&1 | cut -c1-110
echo "== identity =="
PGCONNECT_TIMEOUT=30 psql "$LIVEURL" -X -tAc "SELECT current_user,current_database();" 2>&1
echo "== tables =="
PGCONNECT_TIMEOUT=30 psql "$LIVEURL" -X -tAc "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1;" 2>&1
echo "== migrations =="
PGCONNECT_TIMEOUT=30 psql "$LIVEURL" -X -tAc "SELECT id,name FROM migrations ORDER BY id;" 2>&1
echo "== counts =="
PGCONNECT_TIMEOUT=30 psql "$LIVEURL" -X -tAc "
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
} >>"$OUTF" 2>&1
echo "script_ran=1 log_bytes=$(wc -c <"$OUTF")"