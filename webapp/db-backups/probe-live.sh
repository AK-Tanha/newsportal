#!/usr/bin/env bash
# READ-ONLY live probe. Password value lives only in this shell var; never printed.
set +H
W=$(ls -d /Users/*/workstations/newsportal/webapp | sed -n '1p')
OUT="$W/db-backups/live-state.log"
: > "$OUT"

# Extract the live URL from the commented #DATABASE_URL= line. Only keep in var.
LIVE=$(sed -nE '/^#[[:space:]]*DATABASE_URL=/{s/^#[[:space:]]*DATABASE_URL=//;p}' "$W/.env" | sed -n '1p')

{
  echo "mask=$(printf '%s' "$LIVE" | sed -E 's#(postgresql://[^:]+:)[^@]+@#\1REDACTED@#')"
  echo "hostport=$(printf '%s' "$LIVE" | sed -E 's#postgresql://[^@]*@##; s#/.*##')"
  echo "host=$(printf '%s' "$LIVE" | sed -E 's#postgresql://[^@]*@##; s#:[0-9]+/.*##')"
  echo "port=$(printf '%s' "$LIVE" | sed -E 's#.*:([0-9]+)/.*#\1#')"
  echo "=== 1 tcp ==="
  HOST=$(printf '%s' "$LIVE" | sed -E 's#postgresql://[^@]*@##; s#:[0-9]+/.*##')
  PORT=$(printf '%s' "$LIVE" | sed -E 's#.*:([0-9]+)/.*#\1#')
  nc -z -G 15 "$HOST" "$PORT" && echo "TCP_OPEN ${HOST}:${PORT}" || echo "TCP_CLOSED"
  echo "=== 2 version ==="
  PGCONNECT_TIMEOUT=30 psql "$LIVE" -X -tAc "SELECT version();" 2>&1 | sed -E 's/\([0-9]+\)//g' | cut -c1-80
  echo "=== 3 identity ==="
  PGCONNECT_TIMEOUT=30 psql "$LIVE" -X -tAc "SELECT current_user,current_database();" 2>&1
  echo "=== 4 public tables ==="
  PGCONNECT_TIMEOUT=30 psql "$LIVE" -X -tAc "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1;" 2>&1
  echo "=== 5 migrations ==="
  PGCONNECT_TIMEOUT=30 psql "$LIVE" -X -tAc "SELECT id,name FROM migrations ORDER BY id;" 2>&1
  echo "=== 6 counts ==="
  PGCONNECT_TIMEOUT=30 psql "$LIVE" -X -tAc "
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
} >>"$OUT" 2>&1

echo "host=$(printf '%s' "$LIVE" | sed -E 's#postgresql://[^@]*@##; s#:[0-9]+/.*#')"
echo "probe_bytes=$(wc -c <"$OUT")"
