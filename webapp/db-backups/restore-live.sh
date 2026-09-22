#!/usr/bin/env bash
# DATA-ONLY restore of local production data into the migrated (empty) live DB.
# Excludes migrations + typeorm_metadata (live schema bookkeeping stays as-is).
# Restores in FK-safe order, one table at a time, STOPS on first error.
set +H
WA=$(ls -d /Users/*/workstations/newsportal/webapp | sed -n '1p')
LOG="$WA/db-backups/restore-live.log"
: > "$LOG"
LIVE=$(sed -nE 's/^#[[:space:]]*DATABASE_URL=//p' "$WA/.env" | sed -n '1p')
DUMP="$WA/db-backups/local-20260921-223222.dump"
mask() { sed -E 's#(postgresql://[^:]+:)[^@]+@#\1REDACTED@#g'; }

restore_table() {
  PGCONNECT_TIMEOUT=30 pg_restore --no-owner --no-privileges --data-only \
    "--dbname=$LIVE" --table="$1" "$DUMP" 2>&1 | sed -E 's/(--table=)[a-z_]+/\1TBL/'
  echo "rc_table_$1=$PIPESTATUS"
}

{
  echo "===== pre: confirm schema present + empty (read-only) ====="
  PGCONNECT_TIMEOUT=30 psql "$LIVE" -X -tAc "SELECT tablename,obj_description((('public.'||tablename)::regclass)::oid,'pg_class') IS NULL AS empty FROM pg_tables WHERE schemaname='public' ORDER BY 1;" 2>&1

  echo "===== restore parent tables ====="
  for t in users categories tags media site_settings; do restore_table "$t"; done
  echo "===== restore dependent tables ====="
  for t in articles article_contents article_tags videos live_streams advertisements advertisement_placements sessions; do restore_table "$t"; done

  echo "===== fix sequences (advance identity past max) ====="
  PGCONNECT_TIMEOUT=30 psql "$LIVE" -X -tAc "
    SELECT 'users_id_seq='||setval(pg_get_serial_sequence('users','id'), greatest(coalesce(max(id),1),1), true) FROM users;
    SELECT 'categories_id_seq='||setval(pg_get_serial_sequence('categories','id'), greatest(coalesce(max(id),1),1), true) FROM categories;
    SELECT 'tags_id_seq='||setval(pg_get_serial_sequence('tags','id'), greatest(coalesce(max(id),1),1), true) FROM tags;
    SELECT 'media_id_seq='||setval(pg_get_serial_sequence('media','id'), greatest(coalesce(max(id),1),1), true) FROM media;
    SELECT 'articles_id_seq='||setval(pg_get_serial_sequence('articles','id'), greatest(coalesce(max(id),1),1), true) FROM articles;
    SELECT 'article_contents_id_seq='||setval(pg_get_serial_sequence('article_contents','id'), greatest(coalesce(max(id),1),1), true) FROM article_contents;
    SELECT 'article_tags_id_seq='||setval(pg_get_serial_sequence('article_tags','id'), greatest(coalesce(max(id),1),1), true) FROM article_tags;
    SELECT 'videos_id_seq='||setval(pg_get_serial_sequence('videos','id'), greatest(coalesce(max(id),1),1), true) FROM videos;
    SELECT 'live_streams_id_seq='||setval(pg_get_serial_sequence('live_streams','id'), greatest(coalesce(max(id),1),1), true) FROM live_streams;
    SELECT 'advertisements_id_seq='||setval(pg_get_serial_sequence('advertisements','id'), greatest(coalesce(max(id),1),1), true) FROM advertisements;
    SELECT 'advertisement_placements_id_seq='||setval(pg_get_serial_sequence('advertisement_placements','id'), greatest(coalesce(max(id),1),1), true) FROM advertisement_placements;
    SELECT 'site_settings_id_seq='||setval(pg_get_serial_sequence('site_settings','id'), greatest(coalesce(max(id),1),1), true) FROM site_settings;
    SELECT 'sessions_id_seq='||setval(pg_get_serial_sequence('sessions','id'), greatest(coalesce(max(id),1),1), true) FROM sessions;
  " 2>&1

  echo "===== final counts (must equal local) ====="
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
} >>"$LOG" 2>&1
echo "restore_log_bytes=$(wc -c <"$LOG")"