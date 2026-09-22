#!/usr/bin/env bash
# FINAL read-only confidence probe (no writes to any DB). Then decision to migrate live.
set +H
RAN=$(ls -d /Users/*/workstations/newsportal/webapp/db-backups/loadenv-precedence.sh | sed -n '1p')
awk '/^[[:space:]]*case/,/ESAC/' "$RAN" 2>/dev/null | sed -n '1p'
awk -F' */' '/runtime/{print "runtime_sh: " $0}' "$RAN" 2>/dev/null
Z="$(dirname "$RAN")"
got=$(wc -l <"$Z/../db-backups/id-reshape.dat" 2>/dev/null | tr -d ' ')
echo "sh_xflags_bytes=$(wc -c <"$RAN") grid_lines=$got"
