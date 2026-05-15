#!/bin/bash

################################################################################
# BRANDENTIFY AUTOMATED TEST SUITE
# Tests all critical endpoints and features before/after deployment
# Usage: ./scripts/test-suite.sh [--url http://localhost:5000] [--verbose]
################################################################################

set -euo pipefail

# Configuration
BASE_URL="${TEST_URL:-http://localhost:5000}"
VERBOSE="${VERBOSE:-false}"
FAILED_TESTS=()
PASSED_TESTS=()
TOTAL_TESTS=0

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --url)
      BASE_URL="$2"
      shift 2
      ;;
    --verbose)
      VERBOSE="true"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

################################################################################
# UTILITY FUNCTIONS
################################################################################

log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✅${NC} $1"
}

log_error() {
  echo -e "${RED}❌${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

run_test() {
  local test_name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  local expected_status="${5:-200}"
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  if [ "$VERBOSE" = "true" ]; then
    echo ""
    log_info "Running: $test_name"
  fi
  
  local url="${BASE_URL}${endpoint}"
  local response
  local http_code
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$url")
  elif [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
      -H "Content-Type: application/json" \
      -d "$data")
  else
    log_error "Unknown HTTP method: $method"
    return 1
  fi
  
  # Extract status code (last line)
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$VERBOSE" = "true" ]; then
    echo "Response: $body"
  fi
  
  # Check if status code matches expected
  if [ "$http_code" = "$expected_status" ]; then
    log_success "$test_name (HTTP $http_code)"
    PASSED_TESTS+=("$test_name")
    return 0
  else
    log_error "$test_name - Expected HTTP $expected_status, got $http_code"
    FAILED_TESTS+=("$test_name")
    if [ "$VERBOSE" = "true" ]; then
      echo "Body: $body"
    fi
    return 1
  fi
}

verify_json_field() {
  local json="$1"
  local field="$2"
  
  echo "$json" | jq -e "$field" > /dev/null 2>&1
}

################################################################################
# TEST SUITES
################################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║          BRANDENTIFY AUTOMATED TEST SUITE                            ║"
echo "║          Target: $BASE_URL"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# ==============================================================================
# SECTION 1: USER & AUTHENTICATION ENDPOINTS
# ==============================================================================

echo "${BLUE}📋 SECTION 1: USER & AUTHENTICATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Get user profile" "GET" "/api/users/2" "" "200"
run_test "Get user by username" "GET" "/api/users/username/Unvhj38FHSg36vbagvGL8MvDJuL2" "" "200"
run_test "Get user XP" "GET" "/api/xp/2" "" "200"
run_test "Get user badges" "GET" "/api/users/2/badges" "" "200"

# ==============================================================================
# SECTION 2: PULSE & FEED ENDPOINTS
# ==============================================================================

echo ""
echo "${BLUE}📰 SECTION 2: PULSE & FEED${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Get main feed (pulses)" "GET" "/api/pulses?limit=10" "" "200"
run_test "Get personalized feed" "GET" "/api/personalized-feed/2?limit=10" "" "200"

# ==============================================================================
# SECTION 3: REACTION FEATURES (CRITICAL)
# ==============================================================================

echo ""
echo "${BLUE}💬 SECTION 3: REACTION FEATURES${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_info "Testing reaction system (insightful, misinformed, quota tracking)..."

# Create test reaction - insightful (use unique user/pulse combo)
run_test "Create insightful reaction" "POST" "/api/pulse-reactions" \
  '{"userId": 13, "pulseId": 404, "reactionType": "insightful"}' "201"

# Try duplicate (should fail with 409)
run_test "Prevent duplicate insightful reaction" "POST" "/api/pulse-reactions" \
  '{"userId": 13, "pulseId": 404, "reactionType": "insightful"}' "409"

# Switch reaction type
run_test "Switch reaction to misinformed" "POST" "/api/pulse-reactions" \
  '{"userId": 13, "pulseId": 404, "reactionType": "misinformed"}' "201"

# Create misinformed reaction on different pulse
run_test "Create misinformed reaction (different pulse)" "POST" "/api/pulse-reactions" \
  '{"userId": 14, "pulseId": 401, "reactionType": "misinformed"}' "201"

# Get reaction quota
run_test "Get reaction quota" "GET" "/api/reaction-quota?userId=3" "" "200"

# ==============================================================================
# SECTION 4: SUBSCRIPTION & FEATURE GATING
# ==============================================================================

echo ""
echo "${BLUE}💳 SECTION 4: SUBSCRIPTION & FEATURE GATING${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Get subscription status" "GET" "/api/subscription/2" "" "200"
run_test "Get pricing" "GET" "/api/pricing" "" "200"

# ==============================================================================
# SECTION 5: CAREER TOOLS ENDPOINTS
# ==============================================================================

echo ""
echo "${BLUE}🚀 SECTION 5: CAREER TOOLS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Get resumes" "GET" "/api/users/2/resumes" "" "200"
run_test "Get experiences" "GET" "/api/experiences?userId=2" "" "200"
run_test "Get educations" "GET" "/api/educations?userId=2" "" "200"
run_test "Get career quests" "GET" "/api/career-quests?userId=2" "" "200"
run_test "Get social quests" "GET" "/api/social-quests?userId=2" "" "200"

# ==============================================================================
# SECTION 6: PORTFOLIO & PROJECTS
# ==============================================================================

echo ""
echo "${BLUE}🎨 SECTION 6: PORTFOLIO & PROJECTS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Get user portfolio" "GET" "/api/users/2/portfolio" "" "200"
run_test "Get user projects" "GET" "/api/users/2/projects" "" "200"
run_test "Get all projects" "GET" "/api/projects" "" "200"

# ==============================================================================
# SECTION 7: SERVICES & WHAT I OFFER
# ==============================================================================

echo ""
echo "${BLUE}⚙️  SECTION 7: SERVICES & WHAT I OFFER${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Get services" "GET" "/api/services?userId=2" "" "200"
run_test "Get what I offer" "GET" "/api/whatioffer/2" "" "200"

# ==============================================================================
# SECTION 8: MESSAGING & NOTIFICATIONS
# ==============================================================================

echo ""
echo "${BLUE}💌 SECTION 8: MESSAGING & NOTIFICATIONS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Get unread message count" "GET" "/api/messaging/unread/count?userId=2" "" "200"
run_test "Get notifications count" "GET" "/api/notifications/2/count" "" "200"
run_test "Get chat messages" "GET" "/api/messaging/chat/2?limit=10" "" "200"

# ==============================================================================
# SECTION 9: SMART FEATURES
# ==============================================================================

echo ""
echo "${BLUE}🧠 SECTION 9: SMART FEATURES${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Get smart connect recommendations" "GET" "/api/smart-connect/2" "" "200"
run_test "Get nowboard recommendations" "GET" "/api/nowboard-items" "" "200"

# ==============================================================================
# SECTION 10: ERROR HANDLING
# ==============================================================================

echo ""
echo "${BLUE}⚠️  SECTION 10: ERROR HANDLING${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Handle invalid user ID" "GET" "/api/users/99999" "" "400"
run_test "Handle invalid reaction" "POST" "/api/pulse-reactions" \
  '{"userId": 1, "pulseId": 1, "reactionType": "invalid"}' "400"

################################################################################
# TEST SUMMARY
################################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                         TEST SUMMARY                                   ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

TOTAL_PASSED=${#PASSED_TESTS[@]}
TOTAL_FAILED=${#FAILED_TESTS[@]}
PASS_RATE=$((TOTAL_PASSED * 100 / TOTAL_TESTS))

echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$TOTAL_PASSED${NC}"
echo -e "Failed: ${RED}$TOTAL_FAILED${NC}"
echo -e "Pass Rate: ${YELLOW}${PASS_RATE}%${NC}"
echo ""

if [ $TOTAL_FAILED -gt 0 ]; then
  echo -e "${RED}Failed Tests:${NC}"
  for test in "${FAILED_TESTS[@]}"; do
    echo -e "  ${RED}•${NC} $test"
  done
  echo ""
  exit 1
else
  echo -e "${GREEN}✨ All tests passed! Application is ready for deployment.${NC}"
  echo ""
  exit 0
fi

