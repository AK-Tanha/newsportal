#!/usr/bin/env bash
# Read-only verification of the local dump contents. Never prints passwords.
set +e
ACTIVE_URL=$(awk -F= 'NR==1{sub(/^DATABASE_URL=/,""); print}' webapp/.env)
LIVE_LINE=$(awk /^[^[:space:]]*DATABASE_URL=.*62\.169\.18\.134/ webapp/.env)
LIVE_URL=$(printf '%s' "$LIVE_LINE" | sed 's/^[^=]*=//')
# TCP reachability to live host (no DB creds needed) with timeout
LIVE_HOST=$(printf '%s' "$LIVE_URL" | sed -E 's#postgresql://[^@]*@([^:/]+).*#\1#')
echo "live_host=$LIVE_HOST"
nc -z -G 8 "$LIVE_HOST" 5432; echo "nc_live_port_exit=$?"

mkdir -p db-backups/live-inspect
OUT=db-backups/live-inspect/live-check.txt
: > "$OUT"
echo "=== live DB read-only connect test ===" >> "$OUT"
if command -v psql >/dev/null; then
  PGCONNECT_TIMEOUT=8 psql "$LIVE_URL" -tAc "SELECT current_user, current_database(), version();" >> "$OUT" 2>&1 <<'EOF'
EOF
  echo "psql_live_exit=$?" >> "$OUT"
  echo "=== live schema object counts ===" >> "$OUT"
  PGCONNECT_TIMEOUT=8 psql "$LIVE_URL" -tAc "
    SELECT 'tables='||count(*) FROM information_schema.tables WHERE table_schema='public';
    SELECT 'sequences='||count(*) FROM information_schema.sequences WHERE sequence_schema='public';
    SELECT 'enums='||count(*) FROM pg_type WHERE typtype='e';
    SELECT 'migration_rows='||count(*) FROM migrations;" >> "$OUT" 2>&1
  echo "=== live existing tables (if any) ===" >> "$OUT"
  PGCONNECT_TIMEOUT=8 psql "$LIVE_URL" -tAc "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1;" >> "$OUT" 2>&1
  echo "=== live user data (admin row) count ===" >> "$OUT"
  PGCONNECT_TIMEOUT=8 psql "$LIVE_URL" -tAc "SELECT count(*) FROM users;" >> "$OUT" 2>&1
else
  echo "psql not found" >> "$OUT"
fi
echo "done" >> "$OUT"
