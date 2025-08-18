// POPUP TEST HELPER - Diagnose and fix popup authentication issues
// Copy to browser console to test popup functionality

console.log("🧪 POPUP TEST HELPER - Diagnosing authentication issues");

function diagnosePoupIssues() {
    console.log("=".repeat(50));
    console.log("POPUP AUTHENTICATION DIAGNOSIS");
    console.log("=".repeat(50));
    
    // Test 1: Check if popups are blocked
    console.log("\n1. TESTING POPUP PERMISSIONS...");
    const testWindow = window.open('', 'popup-test', 'width=300,height=200');
    
    if (!testWindow || testWindow.closed || typeof testWindow.closed === 'undefined') {
        console.log("❌ ISSUE FOUND: Popups are BLOCKED");
        console.log("💡 SOLUTION:");
        console.log("   - Look for popup blocker icon in address bar");
        console.log("   - Click it and select 'Always allow popups'");
        console.log("   - Or go to browser settings and add this domain to popup exceptions");
        console.log(`   - Domain to allow: ${window.location.hostname}`);
        return false;
    } else {
        console.log("✅ Popups are ALLOWED");
        testWindow.close();
    }
    
    // Test 2: Check browser compatibility
    console.log("\n2. CHECKING BROWSER COMPATIBILITY...");
    const userAgent = navigator.userAgent;
    console.log("Browser:", userAgent);
    
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        console.log("⚠️  Safari detected - may have stricter popup policies");
    } else if (userAgent.includes('Firefox')) {
        console.log("⚠️  Firefox detected - check popup blocking settings");
    } else if (userAgent.includes('Chrome')) {
        console.log("✅ Chrome detected - should work well with popups");
    }
    
    // Test 3: Check if in iframe
    console.log("\n3. CHECKING PAGE CONTEXT...");
    if (window !== window.top) {
        console.log("⚠️  WARNING: Page is in an iframe - popups may be restricted");
        console.log("💡 SOLUTION: Open the page directly (not in iframe)");
    } else {
        console.log("✅ Page is not in iframe");
    }
    
    // Test 4: Check domain
    console.log("\n4. CHECKING DOMAIN CONFIGURATION...");
    console.log(`Current domain: ${window.location.hostname}`);
    console.log(`Current protocol: ${window.location.protocol}`);
    
    if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
        console.log("⚠️  WARNING: Non-HTTPS domain may cause issues");
    } else {
        console.log("✅ Domain configuration looks good");
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("DIAGNOSIS COMPLETE");
    console.log("=".repeat(50));
    
    return true;
}

// Run diagnosis
const popupsWorking = diagnosePoupIssues();

// Provide solutions
console.log("\n💡 RECOMMENDED ACTIONS:");

if (!popupsWorking) {
    console.log("1. ENABLE POPUPS for this domain");
    console.log("2. Look for popup blocker icon (🚫) in address bar");
    console.log("3. Click it and select 'Always allow'");
    console.log("4. Try Google authentication again");
} else {
    console.log("1. Popups are working - the issue might be:");
    console.log("   - Closing the popup too quickly");
    console.log("   - Network connectivity during auth");
    console.log("   - Browser security settings");
    console.log("2. Try keeping the popup open until it closes automatically");
    console.log("3. If popup still fails, the system will fallback to redirect");
}

// Helper functions
window.enablePopupsInstructions = function() {
    console.log("📋 HOW TO ENABLE POPUPS:");
    console.log("Chrome: Settings > Privacy & Security > Site Settings > Pop-ups and redirects > Add exception");
    console.log("Firefox: Settings > Privacy & Security > Permissions > Block pop-up windows > Exceptions");
    console.log("Safari: Preferences > Websites > Pop-up Windows > Allow for this site");
    console.log("Edge: Settings > Site permissions > Pop-ups and redirects > Add exception");
};

window.testGoogleAuth = function() {
    console.log("🧪 Testing Google auth flow...");
    console.log("1. Make sure popups are enabled");
    console.log("2. Click 'Sign in with Google'");
    console.log("3. Keep popup open until authentication completes");
    console.log("4. If popup closes, system will fallback to redirect");
};

console.log("\n🔧 Available commands:");
console.log("- enablePopupsInstructions() - Show how to enable popups");
console.log("- testGoogleAuth() - Instructions for testing");
console.log("- diagnosePoupIssues() - Run diagnosis again");