#!/usr/bin/env bash
set +H
WA=$(ls -d /Users/*/workstations/newsportal/webapp | sed -n '1p')
OUTF="$WA/db-backups/env-lines.log"
: > "$OUTF"
i=0
while IFS= read -r ln; do
  i=$((i+1))
  if printf '%s' "$ln" | grep -qE '^[#[:space:]]*DATABASE_URL='; then
    kind=DBURL
  else
    kind=misc
  fi
  masked=$(printf '%s' "$ln" | sed -E 's#(postgresql://[^:]+:)[^@]+@#\1MASKED@#')
  printf '%02d|%s|%s\n' "$i" "$kind" "$masked" >> "$OUTF"
done < "$WA/.env"
echo "total_lines=$(wc -l <"$WA/.env")  bytes_written=$(wc -c <"$OUTF")"
