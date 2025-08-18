// TEST POPUP AUTH - Verify popup authentication is working
// Copy to browser console to test

console.log("🧪 TESTING POPUP AUTHENTICATION");

// Test if popups are allowed
function testPopupBlocked() {
    const testPopup = window.open('', 'test', 'width=100,height=100');
    if (!testPopup || testPopup.closed || typeof testPopup.closed == 'undefined') {
        console.log("❌ POPUPS ARE BLOCKED - This will prevent Google authentication");
        console.log("💡 Solution: Allow popups for this domain in your browser settings");
        return false;
    } else {
        console.log("✅ POPUPS ARE ALLOWED - Google authentication should work");
        testPopup.close();
        return true;
    }
}

// Test popup functionality
const popupsAllowed = testPopupBlocked();

if (popupsAllowed) {
    console.log("🎯 POPUP AUTH READY:");
    console.log("1. Click 'Sign in with Google'");
    console.log("2. Google login popup will open");
    console.log("3. Complete authentication in popup");
    console.log("4. Popup will close and you'll be authenticated");
    console.log("5. You'll be redirected to Industry Pulse");
} else {
    console.log("🚫 POPUP AUTH BLOCKED:");
    console.log("1. Allow popups for this domain");
    console.log("2. Look for popup blocker icon in address bar");
    console.log("3. Click to allow popups");
    console.log("4. Try Google authentication again");
}

// Helper function to enable popups
window.enablePopups = function() {
    console.log("💡 TO ENABLE POPUPS:");
    console.log("1. Look for popup blocker icon in your browser's address bar");
    console.log("2. Click the icon and select 'Allow popups'");
    console.log("3. Or go to browser settings > Privacy & Security > Site Settings > Pop-ups");
    console.log("4. Add this domain to the allowed list");
    console.log(`5. Domain to allow: ${window.location.hostname}`);
};

console.log("Commands available:");
console.log("- enablePopups() - Show instructions to enable popups");
console.log("- testPopupBlocked() - Test if popups are blocked");

console.log(`\n🔧 Current domain: ${window.location.hostname}`);
console.log("📋 Make sure this domain is allowed for popups!");