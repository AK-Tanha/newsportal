#!/usr/bin/env bash
# Run TypeORM migrations against the LIVE (empty) DB using the commented live URL.
# The live URL becomes DATABASE_URL only for this process; .env is never edited here.
set +H
WA=$(ls -d /Users/*/workstations/newsportal/webapp | sed -n '1p')
OUTF="$WA/db-backups/migrate-live.log"
: > "$OUTF"
LIVEURL=$(sed -nE 's/^#[[:space:]]*DATABASE_URL=//p' "$WA/.env" | sed -n '1p')
{
echo "target=$(printf '%s' "$LIVEURL" | sed -E 's#(postgresql://[^:]+:)[^@]+@#\1MASKED@#; s#/.*##')"
echo "== pre-check server =="
PGCONNECT_TIMEOUT=30 psql "$LIVEURL" -X -tAc "SELECT current_user,current_database(),(SELECT count(*) FROM pg_tables WHERE schemaname='public');" 2>&1
echo "== running get_migrations / migrate =="
export DATABASE_URL="$LIVEURL"
cd "$WA" && npm run db:migrate 2>&1 | tail -n 40
echo "== post migrations table =="
PGCONNECT_TIMEOUT=30 psql "$LIVEURL" -X -tAc "SELECT id,name FROM migrations ORDER BY id;" 2>&1
echo "== post public tables =="
PGCONNECT_TIMEOUT=30 psql "$LIVEURL" -X -tAc "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1;" 2>&1
} >>"$OUTF" 2>&1
echo "ran=1 log_bytes=$(wc -c <"$OUTF")"