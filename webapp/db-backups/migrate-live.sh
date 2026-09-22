#!/usr/bin/env bash
# Migrate LIVE (empty) newsportal_db using the app's own TypeORM runner.
# DATABASE_URL is set as a process env var only -- .env is NOT modified.
# The URL/password stay in $LIVE below; never echoed. Output is masked in the log
# via sed (password bytes -> REDACTED) before anything hits the log file.
set +H
WA=$(ls -d /Users/*/workstations/newsportal/webapp | sed -n '1p')
LOG="$WA/db-backups/migrate-live.log"
: > "$LOG"
LIVE=$(sed -nE 's/^#[[:space:]]*DATABASE_URL=//p' "$WA/.env" | sed -n '1p')

mask() { sed -E 's#(postgresql://[^:]+:)[^@]+@#\1REDACTED@#g'; }

{
  echo "===== step 0: pre-condition (read-only) ====="
  PGCONNECT_TIMEOUT=30 psql "$LIVE" -X -tAc "SELECT current_user,current_database();" 2>&1
  PGCONNECT_TIMEOUT=30 psql "$LIVE" -X -tAc "SELECT count(*) FROM pg_tables WHERE schemaname='public';" 2>&1
  echo "===== step 1: run migrations ====="
  cd "$WA" || exit 9
  env -u PGHOST -u PGPORT -u PGUSER -u PGPASSWORD -u PGDATABASE \
      DATABASE_URL="$LIVE" npm run db:migrate 2>&1
  echo "migrate_rc=$?"
  echo "===== step 2: migrations table (read-only) ====="
  PGCONNECT_TIMEOUT=30 psql "$LIVE" -X -tAc "SELECT id,name FROM migrations ORDER BY id;" 2>&1
  echo "===== step 3: tables (read-only) ====="
  PGCONNECT_TIMEOUT=30 psql "$LIVE" -X -tAc "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;" 2>&1
  echo "===== step 4: counts after migration (expect 0s) ====="
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
} 2>&1 | mask >>"$LOG"
echo "migrate_log_bytes=$(wc -c <"$LOG")"