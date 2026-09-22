#!/usr/bin/env bash
# Q: does process.loadEnvFile('.env') override an exported DATABASE_URL?
# This only tests precedence -- it never reads or prints the real password.
set +H
WA=$(ls -d /Users/*/workstations/newsportal/webapp | sed -n '1p')
OUT="$WA/db-backups/loadenv-precedence.log"
: > "$OUT"
TESTENV="$WA/db-backups/_poc-env.txt"
printf 'DATABASE_URL=postgresql://placeholder:X@h:1/from_envfile\n' > "$TESTENV"

cat > "$WA/db-backups/_poc-prec.mjs" <<'ENDJS'
import { loadEnvFile } from "node:process";
const target = process.argv[2];
const pre = process.env.DATABASE_URL ?? "(unset)";
loadEnvFile(target);
const post = process.env.DATABASE_URL ?? "(unset)";
const overridden = pre !== post;
process.stdout.write(
  "pre=" + pre + "\n" +
  "post=" + post + "\n" +
  "loadEnvFile_overrides_exported=" + (overridden ? "YES" : "NO") + "\n"
);
ENDJS

DATABASE_URL="postgresql://exported:EXP@h:1/db_exported" \
  node "$WA/db-backups/_poc-prec.mjs" "$TESTENV" >>"$OUT" 2>&1
rm -f "$WA/db-backups/_poc-prec.mjs" "$TESTENV"
echo "poc_bytes=$(wc -c <"$OUT")"