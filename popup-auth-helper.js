// POPUP AUTH HELPER - Diagnose and fix popup authentication issues
// Copy to browser console to diagnose popup problems

console.log("🔧 POPUP AUTHENTICATION DIAGNOSTICS");
console.log("=".repeat(50));

// Test 1: Check popup blocker
function testPopupBlocker() {
    console.log("TEST 1: Checking popup blocker...");
    
    const testWindow = window.open('about:blank', 'test', 'width=500,height=400');
    
    if (!testWindow) {
        console.log("❌ POPUP BLOCKED: Popup blocker is active");
        console.log("💡 FIX: Allow popups for this domain");
        return false;
    } else if (testWindow.closed) {
        console.log("❌ POPUP BLOCKED: Popup was immediately closed");
        return false;
    } else {
        console.log("✅ POPUP ALLOWED: Popup blocker is not blocking");
        testWindow.close();
        return true;
    }
}

// Test 2: Check third-party cookies
function testThirdPartyCookies() {
    console.log("\nTEST 2: Third-party cookie status...");
    
    // This is a rough check - actual third-party cookie detection is complex
    if (navigator.cookieEnabled) {
        console.log("✅ COOKIES ENABLED: Basic cookies are working");
    } else {
        console.log("❌ COOKIES BLOCKED: Basic cookies are disabled");
    }
    
    console.log("💡 NOTE: Google auth requires third-party cookies to be enabled");
}

// Test 3: Check domain restrictions
function testDomain() {
    console.log("\nTEST 3: Domain analysis...");
    
    const hostname = window.location.hostname;
    const isSecure = window.location.protocol === 'https:';
    const isReplit = hostname.includes('replit') || hostname.includes('repl.co');
    
    console.log(`Domain: ${hostname}`);
    console.log(`Protocol: ${window.location.protocol}`);
    console.log(`Secure: ${isSecure ? '✅' : '❌'}`);
    console.log(`Replit Domain: ${isReplit ? '✅' : '❌'}`);
    
    if (!isSecure && !hostname.includes('localhost')) {
        console.log("⚠️  WARNING: HTTPS required for Google auth on non-localhost domains");
    }
}

// Test 4: Firebase configuration check
async function testFirebaseConfig() {
    console.log("\nTEST 4: Firebase configuration...");
    
    try {
        const { auth } = await import('/src/lib/firebase.ts');
        
        if (auth && auth.app) {
            console.log("✅ FIREBASE: Auth object is initialized");
            console.log("Project ID:", auth.app.options.projectId);
            console.log("Auth Domain:", auth.app.options.authDomain);
        } else {
            console.log("❌ FIREBASE: Auth object not properly initialized");
        }
    } catch (error) {
        console.log("❌ FIREBASE: Failed to load Firebase config");
        console.error(error);
    }
}

// Run all tests
async function runDiagnostics() {
    console.log("🚀 RUNNING POPUP AUTH DIAGNOSTICS...\n");
    
    const popupAllowed = testPopupBlocker();
    testThirdPartyCookies();
    testDomain();
    await testFirebaseConfig();
    
    console.log("\n" + "=".repeat(50));
    console.log("🎯 RECOMMENDATIONS:");
    
    if (!popupAllowed) {
        console.log("1. ⚠️  ENABLE POPUPS: Look for popup blocker icon in address bar");
        console.log("   - Click the icon and allow popups for this domain");
        console.log("   - Or add this domain to your browser's popup whitelist");
    } else {
        console.log("1. ✅ Popups are enabled");
    }
    
    console.log("2. 🍪 ENABLE THIRD-PARTY COOKIES:");
    console.log("   - Chrome: Settings > Privacy and security > Third-party cookies");
    console.log("   - Firefox: Settings > Privacy & Security > Enhanced Tracking Protection");
    console.log("   - Safari: Preferences > Privacy > Prevent cross-site tracking (disable)");
    
    console.log("3. 🔄 TRY THESE STEPS:");
    console.log("   - Clear browser cache and cookies for this domain");
    console.log("   - Try incognito/private browsing mode");
    console.log("   - Disable ad blockers temporarily");
    console.log("   - Try a different browser");
    
    console.log("\n💡 If popup still doesn't work, the app will offer redirect authentication as backup");
}

// Helper functions
window.enablePopupsHelp = function() {
    console.log("🔧 HOW TO ENABLE POPUPS:");
    console.log("Chrome/Edge: Click shield icon in address bar → 'Pop-ups and redirects' → 'Always allow'");
    console.log("Firefox: Click shield icon → 'Block pop-up windows' (disable)");
    console.log("Safari: Safari menu → Preferences → Websites → Pop-up Windows → Allow");
};

window.testAuth = function() {
    console.log("🧪 Testing authentication manually...");
    // This will trigger the Google auth button
    document.querySelector('[data-testid="google-auth-button"]')?.click() ||
    document.querySelector('button:contains("Google")')?.click() ||
    console.log("Could not find Google auth button - try clicking it manually");
};

// Run diagnostics automatically
runDiagnostics();

console.log("\n🔧 HELPER COMMANDS:");
console.log("- enablePopupsHelp() - Show how to enable popups");
console.log("- testAuth() - Test Google authentication");
console.log("- runDiagnostics() - Run full diagnostics again");