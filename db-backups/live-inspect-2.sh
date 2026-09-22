#!/bin/bash
# READ-ONLY live inspection. Password only in a shell var; never printed.
cd "$(dirname "$(find /Users -maxdepth 2 -name webapp -path '*newsportal*' 2>/dev/null | sed -n '1p')")" 2>/dev/null
W=$(ls -d /Users/*/workstations/newsportal/webapp | sed -n '1p')
LIVE_RAW=$(sed -nE '/^#DATABASE_URL=/s/^#DATABASE_URL=//p' "$W/.env" | sed -n '1p')
LOG="$W/db-backups/live-inspect-2.log"; : >"$LOG"
{
  echo "hide_shape=$(printf '%s' "$LIVE_RAW" | sed -E 's#(postgresql://[^:]+:)[^@]+@#\1REDACTED@#')"
  echo "host_port=$(printf '%s' "$LIVE_RAW" | sed -E 's#postgresql://[^@]*@##; s#/.*##')"  --hostport
  LH=$(printf '%s' "$LIVE_RAW" | sed -E 's#postgresql://[^@]*@##; s#:[0-9]+/.*##')
  LP=$(printf '%s' "$LIVE_RAW" | sed -E 's#postgresql://[^@]*@##; s#.*:([0-9]+)/.*#\1#')
  echo "live_${LH}:${LP}_tcp_$(nc -z -G 10 "$LH" "$LP" 2>&1 && echo OPEN || echo CLOSED)"
  echo "=== version ==="
  PGCONNECT_TIMEOUT=12 psql "$LIVE_RAW" -X -tAc "SELECT version();" 2>&1 | fold -w 100 | sed -n '1p'
  echo "=== identity ==="
  PGCONNECT_TIMEOUT=12 psql "$LIVE_RAW" -X -tAc "SELECT current_user||'@'||current_database();" 2>&1
  echo "=== tables ==="
  PGCONNECT_TIMEOUT=12 psql "$LIVE_RAW" -X -tAc "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1;" 2>&1
  echo "=== migrations ==="
  PGCONNECT_TIMEOUT=12 psql "$LIVE_RAW" -X -tAc "SELECT id||':'||name FROM migrations ORDER BY id;" 2>&1
  echo "=== counts ==="
  PGCONNECT_TIMEOUT=12 psql "$LIVE_RAW" -X -tAc "
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
} >>"$LOG" 2>&1
echo "wrote_bytes=$(wc -c <"$LOG")"