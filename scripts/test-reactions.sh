#!/bin/bash

################################################################################
# REACTION FEATURE TEST SUITE
# Comprehensive testing of insightful/misinformed reactions and quota system
# Usage: ./scripts/test-reactions.sh [--url http://localhost:5000]
################################################################################

set -euo pipefail

BASE_URL="${TEST_URL:-http://localhost:5000}"
VERBOSE="${VERBOSE:-false}"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
PASSED=0
FAILED=0

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --url) BASE_URL="$2"; shift 2 ;;
    --verbose) VERBOSE="true"; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

log_test() { echo -e "${BLUE}🧪${NC} $1"; }
log_pass() { echo -e "${GREEN}✅${NC} $1"; PASSED=$((PASSED+1)); }
log_fail() { echo -e "${RED}❌${NC} $1"; FAILED=$((FAILED+1)); }
log_info() { echo -e "${BLUE}ℹ${NC} $1"; }

# Helper function to make API calls
api_call() {
  local method=$1
  local endpoint=$2
  local data=$3
  
  if [ "$method" = "POST" ]; then
    curl -s -X POST "${BASE_URL}${endpoint}" \
      -H "Content-Type: application/json" \
      -d "$data"
  else
    curl -s "${BASE_URL}${endpoint}"
  fi
}

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║              REACTION FEATURE TEST SUITE                               ║"
echo "║              Target: $BASE_URL"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# ==============================================================================
# TEST 1: Create Insightful Reaction
# ==============================================================================

log_test "Create insightful reaction"
RESPONSE=$(api_call "POST" "/api/pulse-reactions" \
  '{"userId": 10, "pulseId": 396, "reactionType": "insightful"}')

if echo "$RESPONSE" | jq -e '.reaction.id' > /dev/null 2>&1; then
  log_pass "Insightful reaction created successfully"
  REACTION_ID=$(echo "$RESPONSE" | jq -r '.reaction.id')
  [ "$VERBOSE" = "true" ] && echo "Reaction ID: $REACTION_ID"
else
  log_fail "Failed to create insightful reaction"
  [ "$VERBOSE" = "true" ] && echo "Response: $RESPONSE"
fi

# ==============================================================================
# TEST 2: Prevent Duplicate Reactions
# ==============================================================================

log_test "Prevent duplicate insightful reaction"
RESPONSE=$(api_call "POST" "/api/pulse-reactions" \
  '{"userId": 10, "pulseId": 396, "reactionType": "insightful"}')

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/pulse-reactions" \
  -H "Content-Type: application/json" \
  -d '{"userId": 10, "pulseId": 396, "reactionType": "insightful"}')

if [ "$HTTP_CODE" = "409" ]; then
  log_pass "Duplicate reaction correctly rejected (HTTP 409)"
else
  log_fail "Duplicate reaction not properly rejected (HTTP $HTTP_CODE)"
fi

# ==============================================================================
# TEST 3: Switch Reaction Type
# ==============================================================================

log_test "Switch reaction from insightful to misinformed"
RESPONSE=$(api_call "POST" "/api/pulse-reactions" \
  '{"userId": 10, "pulseId": 396, "reactionType": "misinformed"}')

if echo "$RESPONSE" | jq -e '.reaction.reactionType | select(. == "misinformed")' > /dev/null 2>&1; then
  log_pass "Reaction successfully switched to misinformed"
  OLD_ID=$(echo "$RESPONSE" | jq -r '.reaction.id')
  [ "$VERBOSE" = "true" ] && echo "New reaction ID: $OLD_ID"
else
  log_fail "Failed to switch reaction type"
  [ "$VERBOSE" = "true" ] && echo "Response: $RESPONSE"
fi

# ==============================================================================
# TEST 4: Quota Tracking (Free Tier)
# ==============================================================================

log_test "Verify free tier quota (max 10/day)"
RESPONSE=$(api_call "POST" "/api/pulse-reactions" \
  '{"userId": 10, "pulseId": 397, "reactionType": "insightful"}')

QUOTA=$(echo "$RESPONSE" | jq '.quota.max')
if [ "$QUOTA" = "10" ]; then
  log_pass "Free tier quota correctly set to 10"
  [ "$VERBOSE" = "true" ] && echo "$RESPONSE" | jq '.quota'
else
  log_fail "Free tier quota incorrect (expected 10, got $QUOTA)"
fi

# ==============================================================================
# TEST 5: Quota Tracking (Premium Tier)
# ==============================================================================

log_test "Verify premium tier quota (max 20/day)"
RESPONSE=$(api_call "POST" "/api/pulse-reactions" \
  '{"userId": 2, "pulseId": 393, "reactionType": "insightful"}')

QUOTA=$(echo "$RESPONSE" | jq '.quota.max')
if [ "$QUOTA" = "20" ]; then
  log_pass "Premium tier quota correctly set to 20"
  [ "$VERBOSE" = "true" ] && echo "$RESPONSE" | jq '.quota'
else
  log_fail "Premium tier quota incorrect (expected 20, got $QUOTA)"
fi

# ==============================================================================
# TEST 6: Quota Usage Tracking
# ==============================================================================

log_test "Verify quota usage is tracked correctly"
RESPONSE1=$(api_call "POST" "/api/pulse-reactions" \
  '{"userId": 11, "pulseId": 393, "reactionType": "insightful"}')
USED_AFTER_1=$(echo "$RESPONSE1" | jq '.quota.used')

RESPONSE2=$(api_call "POST" "/api/pulse-reactions" \
  '{"userId": 11, "pulseId": 401, "reactionType": "misinformed"}')
USED_AFTER_2=$(echo "$RESPONSE2" | jq '.quota.used')

if [ "$USED_AFTER_2" -gt "$USED_AFTER_1" ]; then
  log_pass "Quota usage incremented correctly"
  [ "$VERBOSE" = "true" ] && echo "Usage: $USED_AFTER_1 -> $USED_AFTER_2"
else
  log_fail "Quota usage not incremented"
fi

# ==============================================================================
# TEST 7: Misinformed Reactions
# ==============================================================================

log_test "Create misinformed reaction"
RESPONSE=$(api_call "POST" "/api/pulse-reactions" \
  '{"userId": 12, "pulseId": 404, "reactionType": "misinformed"}')

if echo "$RESPONSE" | jq -e '.reaction.reactionType | select(. == "misinformed")' > /dev/null 2>&1; then
  log_pass "Misinformed reaction created successfully"
  [ "$VERBOSE" = "true" ] && echo "$RESPONSE" | jq '.reaction'
else
  log_fail "Failed to create misinformed reaction"
  [ "$VERBOSE" = "true" ] && echo "Response: $RESPONSE"
fi

# ==============================================================================
# TEST 8: Invalid User Handling
# ==============================================================================

log_test "Handle invalid user ID"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/pulse-reactions" \
  -H "Content-Type: application/json" \
  -d '{"userId": 99999, "pulseId": 393, "reactionType": "insightful"}')

if [ "$HTTP_CODE" = "400" ]; then
  log_pass "Invalid user correctly rejected (HTTP 400)"
else
  log_fail "Invalid user not properly rejected (HTTP $HTTP_CODE)"
fi

# ==============================================================================
# TEST 9: Invalid Pulse Handling
# ==============================================================================

log_test "Handle invalid pulse ID"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/pulse-reactions" \
  -H "Content-Type: application/json" \
  -d '{"userId": 2, "pulseId": 99999, "reactionType": "insightful"}')

if [ "$HTTP_CODE" = "500" ] || [ "$HTTP_CODE" = "400" ]; then
  log_pass "Invalid pulse correctly rejected (HTTP $HTTP_CODE)"
else
  log_fail "Invalid pulse not properly rejected (HTTP $HTTP_CODE)"
fi

# ==============================================================================
# TEST 10: Get Reaction Quota Endpoint
# ==============================================================================

log_test "Get reaction quota endpoint"
RESPONSE=$(api_call "GET" "/api/reaction-quota?userId=2")

if echo "$RESPONSE" | jq -e '.max' > /dev/null 2>&1; then
  log_pass "Reaction quota endpoint working"
  [ "$VERBOSE" = "true" ] && echo "$RESPONSE" | jq '.'
else
  log_fail "Reaction quota endpoint failed"
  [ "$VERBOSE" = "true" ] && echo "Response: $RESPONSE"
fi

# ==============================================================================
# SUMMARY
# ==============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                      REACTION TEST SUMMARY                             ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

TOTAL=$((PASSED + FAILED))
PASS_RATE=$((PASSED * 100 / TOTAL))

echo "Total Tests: $TOTAL"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo -e "Pass Rate: ${YELLOW}${PASS_RATE}%${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
  echo -e "${RED}⚠️  Some reaction tests failed!${NC}"
  exit 1
else
  echo -e "${GREEN}✨ All reaction tests passed!${NC}"
  exit 0
fi
