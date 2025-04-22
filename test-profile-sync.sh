#!/bin/bash

# Test script to verify profile data synchronization
echo "=== Profile Data Synchronization Test ==="
echo ""

# Utility function for colored output
print_green() {
    echo -e "\033[0;32m$1\033[0m"
}

print_red() {
    echo -e "\033[0;31m$1\033[0m"
}

print_yellow() {
    echo -e "\033[0;33m$1\033[0m"
}

# 1. Fetch current profile data
echo "1. Fetching current profile data..."
USER_DATA=$(curl -s http://localhost:5000/api/users/1)
CURRENT_NAME=$(echo $USER_DATA | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
CURRENT_WHAT_I_OFFER=$(echo $USER_DATA | grep -o '"whatIOffer":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "Current profile data:"
echo "- Name: $CURRENT_NAME"
echo "- What I Offer: $CURRENT_WHAT_I_OFFER"
echo ""

# 2. Update the profile with new test values
TEST_NAME="Test User (Updated)"
TEST_WHAT_I_OFFER="Leadership, technical excellence, and innovative solutions to complex software challenges. Updated via sync test."

echo "2. Updating profile data..."
# Update name through main user endpoint
curl -s -X PUT -H "Content-Type: application/json" -d "{\"name\":\"$TEST_NAME\"}" http://localhost:5000/api/users/1 > /dev/null

# Update What I Offer through dedicated endpoint
curl -s -X PUT -H "Content-Type: application/json" -d "{\"whatIOffer\":\"$TEST_WHAT_I_OFFER\"}" http://localhost:5000/api/users/1/what-i-offer > /dev/null

echo "Profile updated with:"
echo "- Name: $TEST_NAME"
echo "- What I Offer: $TEST_WHAT_I_OFFER"
echo ""

# 3. Set localStorage flags through test page
echo "3. Setting localStorage flags to simulate completed edit..."
echo "Opening test page to simulate edit completion..."
echo "Please visit http://localhost:5000/test-profile-data-sync.html in your browser"
echo "Then click 'Update Profile' and 'Simulate Edit Completion' buttons"
echo ""

# 4. Wait for a moment to allow server to process
echo "4. Waiting for server to process updates..."
sleep 2
echo ""

# 5. Fetch updated profile data
echo "5. Fetching updated profile data..."
UPDATED_USER_DATA=$(curl -s http://localhost:5000/api/users/1)
UPDATED_NAME=$(echo $UPDATED_USER_DATA | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
UPDATED_WHAT_I_OFFER=$(echo $UPDATED_USER_DATA | grep -o '"whatIOffer":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "Updated profile data:"
echo "- Name: $UPDATED_NAME"
echo "- What I Offer: $UPDATED_WHAT_I_OFFER"
echo ""

# 6. Verify data synchronization
echo "6. Verifying data synchronization..."
if [[ "$UPDATED_NAME" == "$TEST_NAME" ]]; then
    print_green "✓ Name field synchronized successfully"
else
    print_red "✗ Name field synchronization failed"
    echo "  Expected: $TEST_NAME"
    echo "  Actual: $UPDATED_NAME"
fi

if [[ "$UPDATED_WHAT_I_OFFER" == "$TEST_WHAT_I_OFFER" ]]; then
    print_green "✓ What I Offer field synchronized successfully"
else
    print_red "✗ What I Offer field synchronization failed"
    echo "  Expected: $TEST_WHAT_I_OFFER"
    echo "  Actual: $UPDATED_WHAT_I_OFFER"
fi

echo ""
print_yellow "Test complete. To manually verify profile synchronization:"
print_yellow "1. Open http://localhost:5000 in your browser"
print_yellow "2. Navigate to profile page"
print_yellow "3. Click edit profile"
print_yellow "4. Make changes to any field"
print_yellow "5. Save changes"
print_yellow "6. Return to profile view and verify changes appear"

# Done
echo ""
echo "=== Test Complete ==="