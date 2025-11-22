#!/bin/bash

################################################################################
# PRE-DEPLOYMENT CHECKLIST
# Comprehensive validation before deploying to production
# Usage: ./scripts/pre-deployment-check.sh
################################################################################

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Checklist status
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_TOTAL=0

# Helper functions
check_start() {
  echo -e "${CYAN}→${NC} $1"
  CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
}

check_pass() {
  echo -e "${GREEN}  ✅ $1${NC}"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
}

check_fail() {
  echo -e "${RED}  ❌ $1${NC}"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
}

check_warn() {
  echo -e "${YELLOW}  ⚠️  $1${NC}"
}

check_info() {
  echo -e "${BLUE}  ℹ️  $1${NC}"
}

section() {
  echo ""
  echo "╔════════════════════════════════════════════════════════════════╗"
  echo "║ $1"
  echo "╚════════════════════════════════════════════════════════════════╝"
}

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║      BRANDENTIFIER PRE-DEPLOYMENT CHECKLIST                   ║"
echo "║      $(date '+%Y-%m-%d %H:%M:%S')                                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ==============================================================================
# 1. ENVIRONMENT & DEPENDENCIES
# ==============================================================================

section "1️⃣  ENVIRONMENT & DEPENDENCIES"

check_start "Checking Node.js version..."
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  check_pass "Node.js installed: $NODE_VERSION"
else
  check_fail "Node.js not found"
fi

check_start "Checking npm..."
if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  check_pass "npm installed: v$NPM_VERSION"
else
  check_fail "npm not found"
fi

check_start "Checking required files..."
if [ -f "package.json" ]; then
  check_pass "package.json exists"
else
  check_fail "package.json not found"
fi

if [ -f ".env" ] || [ -f ".env.local" ]; then
  check_pass "Environment file exists"
else
  check_warn "No .env file found - ensure environment variables are set"
fi

check_start "Checking database connection..."
if [ ! -z "${DATABASE_URL:-}" ]; then
  check_pass "DATABASE_URL is set"
else
  check_fail "DATABASE_URL is not set"
fi

# ==============================================================================
# 2. CODE QUALITY
# ==============================================================================

section "2️⃣  CODE QUALITY"

check_start "Checking for TypeScript errors..."
if npx tsc --noEmit 2>/dev/null; then
  check_pass "No TypeScript compilation errors"
else
  check_warn "TypeScript errors found (check with: npx tsc --noEmit)"
fi

check_start "Verifying critical files..."
CRITICAL_FILES=(
  "server/routes.ts"
  "server/storage.ts"
  "client/src/App.tsx"
  "shared/schema.ts"
  "server/vite.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    check_pass "$file exists"
  else
    check_fail "$file missing"
  fi
done

# ==============================================================================
# 3. DATABASE
# ==============================================================================

section "3️⃣  DATABASE"

check_start "Checking database migrations..."
if npm run db:push --dry-run 2>/dev/null | grep -q "No changes"; then
  check_pass "Database is up to date"
elif npm run db:push 2>/dev/null; then
  check_pass "Database migrations applied successfully"
else
  check_warn "Could not verify database state - manual check recommended"
fi

check_start "Verifying database accessibility..."
if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
  check_pass "Database is accessible"
else
  check_warn "Could not verify database connection"
fi

# ==============================================================================
# 4. LOCAL TESTING
# ==============================================================================

section "4️⃣  LOCAL TESTING"

check_start "Building project..."
if npm run build > /tmp/build.log 2>&1; then
  check_pass "Build successful"
else
  check_fail "Build failed (check /tmp/build.log)"
fi

check_start "Starting local server..."
if npm run dev > /tmp/server.log 2>&1 &
then
  SERVER_PID=$!
  sleep 5
  
  if curl -s http://localhost:5000/api/users/1 > /dev/null 2>&1; then
    check_pass "Server started successfully (PID: $SERVER_PID)"
    
    # Run test suite
    check_start "Running comprehensive test suite..."
    if ./scripts/test-suite.sh > /tmp/test-results.log 2>&1; then
      check_pass "All tests passed"
      check_info "Full results: $(cat /tmp/test-results.log | tail -3)"
    else
      check_fail "Some tests failed (check /tmp/test-results.log)"
    fi
    
    # Run reaction tests
    check_start "Running reaction feature tests..."
    if ./scripts/test-reactions.sh > /tmp/reaction-results.log 2>&1; then
      check_pass "All reaction tests passed"
    else
      check_warn "Some reaction tests failed (run with --verbose for details)"
    fi
    
    # Kill server
    kill $SERVER_PID 2>/dev/null || true
  else
    check_fail "Server did not respond (check /tmp/server.log)"
    kill $SERVER_PID 2>/dev/null || true
  fi
else
  check_fail "Failed to start server"
fi

# ==============================================================================
# 5. SECURITY
# ==============================================================================

section "5️⃣  SECURITY"

check_start "Checking for exposed secrets..."
if grep -r "OPENAI_API_KEY" . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null | grep -v "process.env\|import.meta.env" > /tmp/secret-check.log 2>&1; then
  check_warn "Possible exposed API key - review /tmp/secret-check.log"
else
  check_pass "No exposed secrets detected"
fi

check_start "Verifying environment variables..."
REQUIRED_VARS=(
  "DATABASE_URL"
  "NODE_ENV"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [ ! -z "${!var:-}" ]; then
    check_pass "$var is set"
  else
    check_fail "$var is not set"
  fi
done

# ==============================================================================
# 6. DEPLOYMENT READINESS
# ==============================================================================

section "6️⃣  DEPLOYMENT READINESS"

check_start "Checking git status..."
if git diff --quiet 2>/dev/null; then
  check_pass "All changes are committed"
else
  check_warn "Uncommitted changes detected (review before deploy)"
  git status
fi

check_start "Checking for todos..."
if grep -r "TODO\|FIXME\|XXX" src/ server/ 2>/dev/null | wc -l | grep -q "^0$"; then
  check_pass "No TODOs found in code"
else
  check_warn "Found TODOs in code - review before deploying"
  grep -r "TODO\|FIXME\|XXX" src/ server/ 2>/dev/null | head -5
fi

check_start "Verifying test files..."
if [ -f "scripts/test-suite.sh" ] && [ -x "scripts/test-suite.sh" ]; then
  check_pass "Test suite is ready"
else
  check_fail "Test suite not found or not executable"
fi

# ==============================================================================
# 7. PRODUCTION CHECKLIST
# ==============================================================================

section "7️⃣  PRODUCTION CHECKLIST"

echo ""
echo "Before deploying to production, verify:"
echo ""
echo -e "${CYAN}□${NC} All critical endpoints tested and working"
echo -e "${CYAN}□${NC} Subscription system tested (free & premium tiers)"
echo -e "${CYAN}□${NC} Reaction features tested (insightful, misinformed)"
echo -e "${CYAN}□${NC} User quota tracking verified"
echo -e "${CYAN}□${NC} Database migrations applied"
echo -e "${CYAN}□${NC} Environment variables configured"
echo -e "${CYAN}□${NC} Error handling working properly"
echo -e "${CYAN}□${NC} Performance acceptable"
echo -e "${CYAN}□${NC} Security review completed"
echo -e "${CYAN}□${NC} Backup strategy in place"
echo ""

# ==============================================================================
# FINAL SUMMARY
# ==============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   CHECKLIST SUMMARY                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

PASS_RATE=$((CHECKS_PASSED * 100 / CHECKS_TOTAL))

echo "Total Checks: $CHECKS_TOTAL"
echo -e "Passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Failed: ${RED}$CHECKS_FAILED${NC}"
echo -e "Pass Rate: ${YELLOW}${PASS_RATE}%${NC}"
echo ""

if [ $CHECKS_FAILED -gt 0 ]; then
  echo -e "${RED}⚠️  DEPLOYMENT BLOCKED${NC}"
  echo "Fix the above issues before deploying to production."
  echo ""
  exit 1
else
  echo -e "${GREEN}✅ PRE-DEPLOYMENT CHECKS PASSED${NC}"
  echo ""
  echo "The application is ready for deployment!"
  echo ""
  echo "Next steps:"
  echo "1. Review the test results above"
  echo "2. Deploy to production"
  echo "3. Run post-deployment tests: ./scripts/test-suite.sh --url <production-url>"
  echo ""
  exit 0
fi
