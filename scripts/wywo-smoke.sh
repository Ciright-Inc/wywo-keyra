#!/usr/bin/env bash
# End-to-end smoke test for every WYWO action against the running dev server.
# Relies on KEYRA_DEV_SESSION_PHONE being set in .env so the API routes resolve
# the dev actor without a session cookie.
set -u

BASE="${BASE:-http://localhost:3030}"
PASS=0
FAIL=0
FAIL_LOG=""

# Pick a unique recipient phone per run so trust state from previous runs (e.g.
# a BLOCKED contact left over from the flow-check) can't break this smoke pass.
RECIPIENT="+9190542${RANDOM:0:5}"
REFERRAL="+353871234567"

step() {
  printf '\n──── %-58s ────\n' "$1" >&2
}

check() {
  local label="$1"
  local status="$2"
  local body="$3"
  if [[ "$status" =~ ^2 ]] && echo "$body" | grep -q '"ok":true'; then
    PASS=$((PASS+1))
    printf '  ✓ %s\n' "$label" >&2
  else
    FAIL=$((FAIL+1))
    FAIL_LOG+="\n  ✗ ${label}: HTTP ${status}\n     ${body}"
    printf '  ✗ %s [HTTP %s]\n     %s\n' "$label" "$status" "$body" >&2
  fi
}

req() {
  local method="$1" path="$2" data="${3:-}"
  if [[ -n "$data" ]]; then
    curl -sS -X "$method" "$BASE$path" \
      -H 'Content-Type: application/json' \
      -d "$data" -w '\n%{http_code}'
  else
    curl -sS -X "$method" "$BASE$path" -w '\n%{http_code}'
  fi
}

run() {
  local label="$1" method="$2" path="$3" data="${4:-}"
  local raw
  raw=$(req "$method" "$path" "$data")
  local status=$(echo "$raw" | tail -n1)
  local body=$(echo "$raw" | sed '$d')
  check "$label" "$status" "$body"
  echo "$body"
}

extract() {
  # extract a JSON string value by key — naive but enough for the smoke test
  echo "$1" | grep -oE "\"$2\":\"[^\"]*\"" | head -1 | sed -E "s/\"$2\":\"([^\"]*)\"/\1/"
}

step "1. Onboarding world (GET + POST)"
WORLD=$(run "GET /api/wywo/onboarding" GET /api/wywo/onboarding)
run "POST /api/wywo/onboarding (update profile)" POST /api/wywo/onboarding \
  '{"company":"Keyra","role":"Founder","country":"Ireland","preferredDevice":"desktop","notificationRules":{"sms":true,"email":true,"push":false,"afterHoursOnlyTrusted":true}}' >/dev/null

step "2. Compose to unknown recipient → invite flow"
COMPOSE=$(run "POST /api/wywo/messages (unknown recipient)" POST /api/wywo/messages \
  "{\"recipientPhone\":\"$RECIPIENT\",\"recipientName\":\"Recipient Test\",\"subject\":\"Smoke Test 1\",\"body\":\"hello, this is a smoke test message\",\"priority\":\"normal\",\"category\":\"general\"}")
MSG_ID=$(extract "$COMPOSE" "id")
INVITE_TOKEN=$(extract "$COMPOSE" "inviteToken")
echo "    msg.id = $MSG_ID"
echo "    inviteToken = $INVITE_TOKEN"

step "3. Compose to self (should fail)"
SELF=$(req POST /api/wywo/messages '{"recipientPhone":"+919854223823","subject":"x","body":"y"}')
S_STATUS=$(echo "$SELF" | tail -n1)
S_BODY=$(echo "$SELF" | sed '$d')
if [[ "$S_STATUS" =~ ^4 ]] && echo "$S_BODY" | grep -q "cannot send"; then
  PASS=$((PASS+1)); echo "  ✓ rejected self-send (HTTP $S_STATUS)"
else
  FAIL=$((FAIL+1)); echo "  ✗ self-send not rejected: $S_STATUS / $S_BODY"
fi

step "4. List sent messages"
run "GET /api/wywo/messages?direction=sent" GET '/api/wywo/messages?direction=sent&perPage=5' >/dev/null

step "5. Fetch single message"
if [[ -n "$MSG_ID" ]]; then
  run "GET /api/wywo/messages/$MSG_ID" GET "/api/wywo/messages/$MSG_ID" >/dev/null
fi

step "6. Invites (list)"
run "GET /api/wywo/invite" GET /api/wywo/invite >/dev/null

step "7. Trust rings (POST + GET)"
run "POST /api/wywo/trust-rings (add executive contact)" POST /api/wywo/trust-rings \
  "{\"contactPhone\":\"$REFERRAL\",\"contactName\":\"Cara Lynch\",\"trustStatus\":\"EXECUTIVE_RING\",\"trustRing\":\"EXECUTIVE_RING\"}" >/dev/null
run "GET /api/wywo/trust-rings" GET /api/wywo/trust-rings >/dev/null

step "8. Admin list + audit"
run "GET /api/wywo/admin/messages" GET '/api/wywo/admin/messages?perPage=5' >/dev/null
run "GET /api/wywo/admin/audit" GET '/api/wywo/admin/audit?limit=10' >/dev/null

step "9. Archive sent message"
if [[ -n "$MSG_ID" ]]; then
  run "POST /api/wywo/messages/$MSG_ID/archive" POST "/api/wywo/messages/$MSG_ID/archive" '{}' >/dev/null
fi

step "10. Reply on sent message (sender replies to themselves via target recipient)"
if [[ -n "$MSG_ID" ]]; then
  run "POST /api/wywo/messages/$MSG_ID/reply" POST "/api/wywo/messages/$MSG_ID/reply" \
    '{"body":"smoke-test follow-up"}' >/dev/null
fi

step "Summary"
printf 'PASS: %d   FAIL: %d\n' "$PASS" "$FAIL"
if [[ $FAIL -gt 0 ]]; then
  printf '%b\n' "$FAIL_LOG"
  exit 1
fi
exit 0
