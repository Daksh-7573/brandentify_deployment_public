// POPUP TROUBLESHOOTING - Diagnose why Google popup closes
// Copy this to browser console to diagnose the popup issue

console.log("🔍 POPUP TROUBLESHOOTING TOOL");
console.log("=".repeat(50));

// Test popup blocker and third-party cookies
function diagnosePopupIssues() {
    console.log("1. TESTING POPUP BLOCKER...");
    
    const testPopup = window.open('about:blank', 'test', 'width=500,height=600');
    
    if (!testPopup) {
        console.log("❌ POPUP BLOCKED: Browser is blocking popups");
        console.log("SOLUTION: Enable popups for this domain");
        return false;
    } else if (testPopup.closed) {
        console.log("❌ POPUP IMMEDIATELY CLOSED: Popup blocker active");
        return false;
    } else {
        console.log("✅ POPUP TEST PASSED: Popups are allowed");
        testPopup.close();
    }
    
    console.log("\n2. TESTING THIRD-PARTY COOKIES...");
    
    // Test cookie setting
    try {
        document.cookie = "test_cookie=test_value; SameSite=None; Secure";
        console.log("✅ COOKIE TEST: Basic cookie setting works");
    } catch (error) {
        console.log("❌ COOKIE ERROR:", error.message);
    }
    
    console.log("\n3. DOMAIN AND PROTOCOL CHECK...");
    console.log("- Domain:", window.location.hostname);
    console.log("- Protocol:", window.location.protocol);
    console.log("- Is HTTPS:", window.location.protocol === 'https:');
    console.log("- Is Replit:", window.location.hostname.includes('replit'));
    
    if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
        console.log("⚠️ WARNING: HTTPS required for Google auth on this domain");
    }
    
    return true;
}

// Test Firebase popup directly with monitoring
async function testFirebasePopupWithMonitoring() {
    console.log("\n🔬 TESTING FIREBASE POPUP WITH MONITORING...");
    
    try {
        // Import Firebase modules
        const { auth, googleProvider } = await import('/src/lib/firebase.ts');
        const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
        
        console.log("Firebase modules loaded successfully");
        
        // Create monitored provider
        const monitoredProvider = new GoogleAuthProvider();
        monitoredProvider.addScope('email');
        monitoredProvider.addScope('profile');
        monitoredProvider.setCustomParameters({
            prompt: 'select_account',
            display: 'popup'
        });
        
        console.log("Provider configured, opening popup...");
        
        // Monitor popup lifecycle
        const popupPromise = signInWithPopup(auth, monitoredProvider);
        
        // Add timeout to detect if popup hangs
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Popup timeout after 60 seconds'));
            }, 60000);
        });
        
        console.log("Waiting for popup result...");
        
        const result = await Promise.race([popupPromise, timeoutPromise]);
        
        if (result && result.user) {
            console.log("🎉 SUCCESS: Popup authentication worked!");
            console.log("User:", result.user.email);
            console.log("Display Name:", result.user.displayName);
            return true;
        }
        
    } catch (error) {
        console.error("❌ POPUP FAILED:", error);
        
        // Detailed error analysis
        console.log("\n📊 ERROR ANALYSIS:");
        console.log("- Error Code:", error.code);
        console.log("- Error Message:", error.message);
        
        if (error.code === 'auth/popup-closed-by-user') {
            console.log("\n💡 POPUP CLOSED ANALYSIS:");
            console.log("The popup opened but was closed before authentication completed.");
            console.log("Possible causes:");
            console.log("1. User manually closed the popup");
            console.log("2. Popup was automatically closed by browser security");
            console.log("3. Google authentication flow encountered an error");
            console.log("4. Third-party cookies are blocked");
            console.log("5. Content Security Policy is blocking the authentication");
            
            console.log("\n🔧 SOLUTIONS TO TRY:");
            console.log("1. Enable third-party cookies in browser settings");
            console.log("2. Add this domain to cookie exceptions");
            console.log("3. Disable ad blockers temporarily");
            console.log("4. Try incognito/private browsing mode");
            console.log("5. Use redirect authentication instead of popup");
        }
        
        return false;
    }
}

// Check browser compatibility
function checkBrowserCompatibility() {
    console.log("\n🌐 BROWSER COMPATIBILITY CHECK:");
    
    const userAgent = navigator.userAgent;
    console.log("User Agent:", userAgent);
    
    // Check for known problematic browsers/settings
    if (userAgent.includes('Chrome')) {
        console.log("✅ Chrome detected - generally good popup support");
    } else if (userAgent.includes('Firefox')) {
        console.log("✅ Firefox detected - check Enhanced Tracking Protection");
    } else if (userAgent.includes('Safari')) {
        console.log("⚠️ Safari detected - may have strict cookie policies");
    } else {
        console.log("❓ Unknown browser - popup behavior may vary");
    }
    
    // Check JavaScript capabilities
    console.log("- Popup support:", typeof window.open === 'function');
    console.log("- Local storage:", typeof localStorage !== 'undefined');
    console.log("- Session storage:", typeof sessionStorage !== 'undefined');
    console.log("- Cookies enabled:", navigator.cookieEnabled);
}

// Main diagnostic function
async function runFullDiagnostics() {
    console.log("🚀 RUNNING FULL POPUP DIAGNOSTICS...\n");
    
    const popupTest = diagnosePopupIssues();
    checkBrowserCompatibility();
    
    if (popupTest) {
        console.log("\n📋 BASIC TESTS PASSED - Testing Firebase popup...");
        const firebaseTest = await testFirebasePopupWithMonitoring();
        
        if (firebaseTest) {
            console.log("\n🎉 ALL TESTS PASSED! Popup authentication should work.");
        } else {
            console.log("\n⚠️ FIREBASE POPUP FAILED - Will use redirect fallback");
        }
    } else {
        console.log("\n❌ BASIC TESTS FAILED - Fix popup/cookie issues first");
    }
    
    console.log("\n📋 SUMMARY & RECOMMENDATIONS:");
    console.log("1. If popup is blocked: Enable popups for this domain");
    console.log("2. If cookies are blocked: Enable third-party cookies");
    console.log("3. If still failing: The app will automatically use redirect auth");
    console.log("4. Try incognito mode to test without extensions");
}

// Export functions for manual testing
window.diagnosePopupIssues = diagnosePopupIssues;
window.testFirebasePopupWithMonitoring = testFirebasePopupWithMonitoring;
window.checkBrowserCompatibility = checkBrowserCompatibility;
window.runFullDiagnostics = runFullDiagnostics;

// Auto-run diagnostics
runFullDiagnostics();

console.log("\n🔧 AVAILABLE COMMANDS:");
console.log("- runFullDiagnostics() - Run all popup tests");
console.log("- testFirebasePopupWithMonitoring() - Test Firebase popup directly");
console.log("- diagnosePopupIssues() - Check basic popup/cookie functionality");
console.log("- checkBrowserCompatibility() - Check browser-specific issues");