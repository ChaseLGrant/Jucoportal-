#!/usr/bin/env bash
# Ensures deps are installed and the SQLite demo DB exists for web sessions.
set -e
cd "$(dirname "$0")/.."
[ -d node_modules ] || npm install
npx prisma generate >/dev/null 2>&1 || true
if [ ! -f prisma/dev.db ]; then
  npx prisma db push --skip-generate >/dev/null 2>&1
  npx tsx prisma/seed.ts >/dev/null 2>&1 || true
fi
echo "JUCO Portal ready."
