#!/usr/bin/env bash
# Empirically check: does webapp's scripts/db/env.ts loadEnv() override an exported DATABASE_URL?
set +H
WA=$(ls -d /Users/*/workstations/newsportal/webapp | sed -n '1p')
OUT="$WA/db-backups/loadenv-poc.log"
: > "$OUT"
PNODE="$WA/db-backups/loadenv-poc.mjs"
cat > "$PNODE" <<'ENDPOC'
import { loadEnvFile } from "node:process";
loadEnvFile(process.argv[2]);
const u = process.env.DATABASE_URL ?? "";
const overridden = u && u.indexOf("newsportal_db") >= 0;
let pwVisible = false;
try { const m = u.match(/postgresql:\/\/[^:]+:([^@]+)@/); pwVisible = !!m && m[1].length > 0 && m[1] !== "REDACTED"; } catch {}
process.stdout.write(
  "found_url=" + (u ? "yes" : "no") + "\n" +
  "is_live_db=" + (overridden ? "yes" : "no") + "\n" +
  "export_survived=" + (overridden ? "no" : "yes") + "\n" +
  "pw_bytes=" + (pwVisible ? "leaked" : "hidden") + "\n"
);
ENDPOC
DATABASE_URL="postgresql://admin:REDACTED@62.169.18.134:5432/newsportal_db" \
  PGCONNECT_TIMEOUT=8 node "$PNODE" "$WA/.env" >>"$OUT" 2>&1
echo "poc_bytes=$(wc -c <"$OUT")"