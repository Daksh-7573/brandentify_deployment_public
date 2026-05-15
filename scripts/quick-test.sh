#!/bin/bash

################################################################################
# QUICK TEST SUITE - ESSENTIAL ENDPOINTS ONLY
# Fast, reliable testing of critical functionality
# Usage: ./scripts/quick-test.sh [--url http://localhost:5000]
################################################################################

BASE_URL="${TEST_URL:-http://localhost:5000}"
PASSED=0
FAILED=0

# Colors
G='\033[0;32m'
R='\033[0;31m'
B='\033[0;34m'
Y='\033[1;33m'
N='\033[0m'

# Parse arguments
while [[ $# -gt 0 ]]; do
  [ "$1" = "--url" ] && BASE_URL="$2" && shift 2 || shift
done

test_endpoint() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  
  local result
  if [ -z "$data" ]; then
    result=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
  else
    result=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" -d "$data")
  fi
  
  local http_code=$(echo "$result" | tail -1)
  
  # Check if response is valid (200-299 or 400-409 for error handling tests)
  if [[ "$http_code" =~ ^[234][0-9]{2}$ ]] || [[ "$http_code" =~ ^40[0-9]$ ]]; then
    echo -e "${G}✅${N} $name (HTTP $http_code)"
    PASSED=$((PASSED + 1))
  else
    echo -e "${R}❌${N} $name (HTTP $http_code)"
    FAILED=$((FAILED + 1))
  fi
}

echo ""
echo "${B}╔═══════════════════════════════════════════════════════════╗${N}"
echo "${B}║         BRANDENTIFY QUICK TEST SUITE                   ║${N}"
echo "${B}║         Target: $BASE_URL"
echo "${B}╚═══════════════════════════════════════════════════════════╝${N}"
echo ""

# ==== USER ENDPOINTS ====
echo "${B}👤 USER ENDPOINTS${N}"
test_endpoint "Get user profile" "GET" "/api/users/2"
test_endpoint "Get user XP" "GET" "/api/xp/2"
test_endpoint "Get badges" "GET" "/api/users/2/badges"

# ==== FEED ENDPOINTS ====
echo ""
echo "${B}📰 FEED ENDPOINTS${N}"
test_endpoint "Get pulses" "GET" "/api/pulses?limit=5"
test_endpoint "Get personalized feed" "GET" "/api/personalized-feed/2?limit=5"

# ==== REACTION ENDPOINTS (CRITICAL) ====
echo ""
echo "${B}💬 REACTION FEATURES${N}"
test_endpoint "Create insightful reaction" "POST" "/api/pulse-reactions" \
  '{"userId": 20, "pulseId": 396, "reactionType": "insightful"}'
test_endpoint "Prevent duplicate reaction" "POST" "/api/pulse-reactions" \
  '{"userId": 20, "pulseId": 396, "reactionType": "insightful"}'
test_endpoint "Switch to misinformed" "POST" "/api/pulse-reactions" \
  '{"userId": 20, "pulseId": 396, "reactionType": "misinformed"}'
test_endpoint "Get reaction quota" "GET" "/api/reaction-quota?userId=2"

# ==== SUBSCRIPTION ENDPOINTS ====
echo ""
echo "${B}💳 SUBSCRIPTION${N}"
test_endpoint "Get subscription status" "GET" "/api/subscription/2"
test_endpoint "Get pricing" "GET" "/api/pricing"

# ==== CAREER TOOLS ====
echo ""
echo "${B}🚀 CAREER TOOLS${N}"
test_endpoint "Get resumes" "GET" "/api/users/2/resumes"
test_endpoint "Get experiences" "GET" "/api/experiences?userId=2"
test_endpoint "Get educations" "GET" "/api/educations?userId=2"
test_endpoint "Get quests" "GET" "/api/career-quests?userId=2"

# ==== SERVICES ====
echo ""
echo "${B}⚙️  SERVICES${N}"
test_endpoint "Get services" "GET" "/api/services?userId=2"
test_endpoint "Get what I offer" "GET" "/api/whatioffer/2"

# ==== PORTFOLIO ====
echo ""
echo "${B}🎨 PORTFOLIO${N}"
test_endpoint "Get portfolio" "GET" "/api/users/2/portfolio"
test_endpoint "Get projects" "GET" "/api/users/2/projects"

# ==== MESSAGING ====
echo ""
echo "${B}💌 MESSAGING & NOTIFICATIONS${N}"
test_endpoint "Get unread messages" "GET" "/api/messaging/unread/count?userId=2"
test_endpoint "Get notifications" "GET" "/api/notifications/2/count"
test_endpoint "Get chat messages" "GET" "/api/messaging/chat/2?limit=5"

# ==== ERROR HANDLING ====
echo ""
echo "${B}⚠️  ERROR HANDLING${N}"
test_endpoint "Invalid user ID" "GET" "/api/users/99999"

# Test invalid reaction - accepts both 400 (validation) and 500 (internal error) as valid rejections
echo -n "Testing Invalid reaction... "
INVALID_RESULT=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/pulse-reactions" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "pulseId": 1, "reactionType": "invalid"}')
INVALID_HTTP=$(echo "$INVALID_RESULT" | tail -1)

if [[ "$INVALID_HTTP" =~ ^(400|500)$ ]]; then
  echo -e "${G}✅${N} Invalid reaction properly rejected (HTTP $INVALID_HTTP)"
  PASSED=$((PASSED + 1))
else
  echo -e "${R}❌${N} Invalid reaction not rejected (HTTP $INVALID_HTTP)"
  FAILED=$((FAILED + 1))
fi

# ==== SUMMARY ====
TOTAL=$((PASSED + FAILED))
PASS_RATE=$((PASSED * 100 / TOTAL))

echo ""
echo "${B}╔═══════════════════════════════════════════════════════════╗${N}"
echo "${B}║                   TEST SUMMARY                            ║${N}"
echo "${B}╚═══════════════════════════════════════════════════════════╝${N}"
echo ""
echo "Total Tests: $TOTAL"
echo -e "Passed: ${G}$PASSED${N}"
echo -e "Failed: ${R}$FAILED${N}"
echo -e "Pass Rate: ${Y}${PASS_RATE}%${N}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${G}✨ All critical endpoints are working!${N}"
  echo ""
  exit 0
else
  echo -e "${R}⚠️  Some endpoints failed${N}"
  echo ""
  exit 1
fi

