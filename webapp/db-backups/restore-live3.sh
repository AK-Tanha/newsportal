#!/usr/bin/env bash
# DATA-ONLY restore of verified local dump -> live (migrated, empty). FK-safe order.
# Clean extraction form (proven via probe-live.sh). Dump   : project ROOT db-backups/.
set +H
WA=$(ls -d /Users/*/workstations/newsportal/webapp | sed -n '1p')
ROOT=$(dirname "$WA")
LOG="$WA/db-backups/restore-live3.log"
: > "$LOG"
LIVE=$(sed -nE 's/^#[[:space:]]*DATABASE_URL=//p' "$WA/.env" | sed -n '1p')
DUMP=$(ls "$ROOT/db-backups/local-20260921-223222.dump" | sed -n '1p')

mask() { sed -E 's#(postgresql://[^:]+:)[^@]+@#\1REDACTED@#g'; }

restore_table() {
  PGCONNECT_TIMEOUT=60 pg_restore --no-owner --no-privileges --data-only \
    --dbname="$LIVE" --table="$1" "$DUMP" 2>&1 | mask
  echo "rc_$1=${PIPESTATUS[0]}"
}

{
  echo "===== 0 pre live empty (read-only) ====="
  PGCONNECT_TIMEOUT=60 psql "$LIVE" -X -tAc "SELECT 'users='||count(*) FROM users UNION ALL SELECT 'articles='||count(*) FROM articles UNION ALL SELECT 'sessions='||count(*) FROM sessions;" 2>&1 | mask

  echo "===== 1 parent tables (FK-safe first) ====="
  for t in users categories tags media site_settings; do restore_table "$t"; done

  echo "===== 2 dependent tables ====="
  for t in articles article_contents article_tags videos live_streams advertisements advertisement_placements sessions; do restore_table "$t"; done

  echo "===== 3 advance identity sequences past restored max ====="
  PGCONNECT_TIMEOUT=60 psql "$LIVE" -X -tAc "
    SELECT setval(pg_get_serial_sequence('users','id'), coalesce((SELECT max(id) FROM users),1), true);
    SELECT setval(pg_get_serial_sequence('categories','id'), coalesce((SELECT max(id) FROM categories),1), true);
    SELECT setval(pg_get_serial_sequence('tags','id'), coalesce((SELECT max(id) FROM tags),1), true);
    SELECT setval(pg_get_serial_sequence('media','id'), coalesce((SELECT max(id) FROM media),1), true);
    SELECT setval(pg_get_serial_sequence('articles','id'), coalesce((SELECT max(id) FROM articles),1), true);
    SELECT setval(pg_get_serial_sequence('article_contents','id'), coalesce((SELECT max(id) FROM article_contents),1), true);
    SELECT setval(pg_get_serial_sequence('article_tags','id'), coalesce((SELECT max(id) FROM article_tags),1), true);
    SELECT setval(pg_get_serial_sequence('videos','id'), coalesce((SELECT max(id) FROM videos),1), true);
    SELECT setval(pg_get_serial_sequence('live_streams','id'), coalesce((SELECT max(id) FROM live_streams),1), true);
    SELECT setval(pg_get_serial_sequence('advertisements','id'), coalesce((SELECT max(id) FROM advertisements),1), true);
    SELECT setval(pg_get_serial_sequence('advertisement_placements','id'), coalesce((SELECT max(id) FROM advertisement_placements),1), true);
    SELECT setval(pg_get_serial_sequence('site_settings','id'), coalesce((SELECT max(id) FROM site_settings),1), true);
    SELECT setval(pg_get_serial_sequence('sessions','id'), coalesce((SELECT max(id) FROM sessions),1), true);" 2>&1 | mask

  echo "===== 4 final counts (must equal local ground truth) ====="
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
    SELECT 'sessions='||count(*) FROM sessions;" 2>&1 | mask
} >>"$LOG" 2>&1
echo "restore3_log_bytes=$(wc -c <"$LOG")"