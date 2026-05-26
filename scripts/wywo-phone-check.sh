#!/usr/bin/env bash
# Exercise the WYWO phone-number pipeline across major countries to confirm
# every E.164 path (UI → API → libphonenumber-js → Prisma) accepts valid
# numbers and rejects invalid ones with a clear error.

set -u
BASE="${BASE:-http://localhost:3030}"
PASS=0
FAIL=0
FAILURES=""

post() {
  local phone="$1"
  local body
  body=$(curl -sS -X POST "$BASE/api/wywo/messages" \
    -H 'Content-Type: application/json' \
    -d "{\"recipientPhone\":\"$phone\",\"subject\":\"Phone check\",\"body\":\"phone-pipeline smoke\"}")
  echo "$body"
}

expect_ok() {
  local label="$1" phone="$2"
  local body
  body=$(post "$phone")
  if echo "$body" | grep -q '"ok":true'; then
    PASS=$((PASS+1))
    local stored
    stored=$(echo "$body" | grep -oE '"recipientPhone":"[^"]*"' | head -1 | sed 's/"recipientPhone":"//;s/"$//')
    printf '  ✓ %-44s  input=%-22s  stored=%s\n' "$label" "$phone" "$stored"
  else
    FAIL=$((FAIL+1))
    local err
    err=$(echo "$body" | grep -oE '"error":"[^"]*"' | head -1)
    FAILURES+="\n  ✗ $label  input=$phone  $err"
    printf '  ✗ %-44s  input=%-22s  %s\n' "$label" "$phone" "$err"
  fi
}

expect_reject() {
  local label="$1" phone="$2"
  local body
  body=$(post "$phone")
  if echo "$body" | grep -q '"ok":false'; then
    PASS=$((PASS+1))
    local err
    err=$(echo "$body" | grep -oE '"error":"[^"]*"' | head -1)
    printf '  ✓ %-44s  input=%-22s  rejected (%s)\n' "$label" "$phone" "$err"
  else
    FAIL=$((FAIL+1))
    local stored
    stored=$(echo "$body" | grep -oE '"recipientPhone":"[^"]*"' | head -1)
    FAILURES+="\n  ✗ $label  input=$phone  unexpectedly accepted as $stored"
    printf '  ✗ %-44s  input=%-22s  unexpectedly accepted as %s\n' "$label" "$phone" "$stored"
  fi
}

echo "──── USA (+1) ────"
expect_ok "US mobile, clean E.164"               "+12025550143"
expect_ok "US mobile, no + prefix"               "12025550143"
expect_ok "US mobile, with spaces + parens"      "+1 (202) 555-0143"
expect_ok "US mobile, dashes only"               "+1-202-555-0144"
expect_reject "US — too few digits"              "+12025"
expect_reject "US — area code starts with 0"     "+10205550143"

echo
echo "──── India (+91) ────"
expect_ok "India mobile, clean E.164"            "+919876543210"
expect_ok "India mobile, no + prefix"            "919876543211"
expect_ok "India mobile, with spaces"            "+91 98765 43212"
expect_ok "India mobile, leading 0 stripped"     "+91 0 98765 43213"
expect_reject "India — mobile too short"         "+919876"
expect_reject "India — landline-style invalid"   "+91123"

echo
echo "──── UK (+44) ────"
expect_ok "UK mobile"                            "+447911123451"
expect_ok "UK mobile, leading 0 stripped"        "+44 07911 123452"

echo
echo "──── Ireland (+353) ────"
expect_ok "Ireland mobile"                       "+353871234561"
expect_ok "Ireland mobile, no +"                 "353871234562"

echo
echo "──── Other major regions ────"
expect_ok "Germany +49"                          "+4915112345671"
expect_ok "France +33"                           "+33612345671"
expect_ok "Brazil +55"                           "+5511987654321"
expect_ok "Japan +81"                            "+819012345671"
expect_ok "Australia +61"                        "+61412345671"
expect_ok "Canada +1"                            "+14165550190"
expect_ok "UAE +971"                             "+971501234561"
expect_ok "Singapore +65"                        "+6581234561"
expect_ok "Nigeria +234"                         "+2348012345671"
expect_ok "South Africa +27"                     "+27821234561"

echo
echo "──── Hard reject cases ────"
expect_reject "Empty input"                      ""
expect_reject "Garbage letters"                  "hello"
expect_reject "Random short digits"              "+12"

echo
printf '\nPASS: %d   FAIL: %d\n' "$PASS" "$FAIL"
if [[ $FAIL -gt 0 ]]; then
  printf '%b\n' "$FAILURES"
  exit 1
fi
exit 0
