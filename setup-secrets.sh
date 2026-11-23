#!/bin/bash
# One-time helper: asks for your OpenRouter key and Gmail app password (hidden as you paste),
# tests the OpenRouter key, and saves everything to .env. Nothing is printed or sent anywhere else.
set -e
cd "$(dirname "$0")"
touch .env
upsert() { grep -v "^$1=" .env > .env.tmp || true; printf '%s=%s\n' "$1" "$2" >> .env.tmp; mv .env.tmp .env; }

echo "1) Create a key at https://openrouter.ai/settings/keys, copy it, then paste it here (hidden):"
read -rs KEY; echo
KEY="$(printf '%s' "$KEY" | tr -d '[:space:]')"
code=$(curl -s -o /dev/null -w '%{http_code}' https://openrouter.ai/api/v1/auth/key -H "Authorization: Bearer $KEY")
if [ "$code" != "200" ]; then echo "That key was rejected by OpenRouter (HTTP $code). Nothing saved. Create a new key and run this again."; exit 1; fi
upsert OPENROUTER_API_KEY "$KEY"
echo "OpenRouter key works and is saved."

echo
echo "2) Gmail address that will send the emails:"
read -r GM
echo "3) Create an app password at https://myaccount.google.com/apppasswords, then paste it here (hidden):"
read -rs PW; echo
PW="$(printf '%s' "$PW" | tr -d '[:space:]')"
if [ -z "$GM" ] || [ -z "$PW" ]; then echo "Email settings skipped (empty). Run again to set them."; exit 0; fi
upsert SMTP_USER "$GM"
upsert SMTP_PASS "$PW"
upsert SMTP_FROM "\"CLTH.Y <$GM>\""
upsert NOTIFY_EMAIL "zalak_gogri@forge27.mesaschool.co"
upsert SITE_URL "https://clthy.vercel.app"
echo "Email settings saved."

echo
echo "4) (Optional) Supabase: keep a list of visitors who ask for a report."
echo "   Dashboard -> Project Settings -> API -> copy the service_role key (secret). Paste here, or press Enter to skip (hidden):"
read -rs SB; echo
SB="$(printf '%s' "$SB" | tr -d '[:space:]')"
if [ -n "$SB" ]; then
  upsert SUPABASE_URL "https://xjcxrcmcxxxbhzdurqmx.supabase.co"
  upsert SUPABASE_SERVICE_ROLE_KEY "$SB"
  echo "Supabase saved. Remember to run supabase/report_requests.sql in the Supabase SQL Editor once."
fi
echo "Done. Tell Claude: done."
