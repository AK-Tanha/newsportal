#!/usr/bin/env bash
# FINAL verification (all read-only). Must prove we are ON LIVE newsportal_db,
# show migrations + final counts, and assert counts==local ground truth.
set +H
WA=$(ls -d /Users/*/workstations/newsportal/webapp | sed -n '1p')
OUTF="$WA/db-backups/db-backups/final-verify.log"
: > "$OUTF"
LIVE=$(sed -nE 's/^#[[:space:]]*DATABASE_URL=//p' "$WA/.env" | sed -n '1p')
mask() { sed -E 's#(postgresql://[^:]+:)[^@]+@#\1REDACTED@#g'; }
{
  echo "== discriminant (read-only): must say newsportal_db =="
  PGCONNECT_TIMEOUT=60 psql "$LIVE" -X -tAc "SELECT 'current_database='||current_database()||' current_user='||current_user||' server='||version();" 2>&1 | sed -E 's/\([0-9]+\)//g' | cut -c1-160
  echo "== migrations (must be exactly the 2) =="
  PGCONNECT_TIMEOUT=60 psql "$LIVE" -X -tAc "SELECT id||'. '||name FROM migrations ORDER BY id;" 2>&1
  echo "== final counts =="
  PGCONNECT_TIMEOUT=60 psql "$LIVE" -X -tAc "
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
echo "verify_log_bytes=$(wc -c <"$OUTF")"