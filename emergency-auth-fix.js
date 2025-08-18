// EMERGENCY AUTH FIX - OVERRIDE AUTHENTICATION SYSTEM
// Run this in browser console to completely disable redirect flag creation

console.log("🚨 EMERGENCY AUTH FIX - Overriding authentication system");

// Override sessionStorage.setItem to prevent redirect flags
const originalSessionSetItem = sessionStorage.setItem;
sessionStorage.setItem = function(key, value) {
    if (key === 'redirect_auth_attempt' || key === 'redirect_auth_time') {
        console.log(`🚫 BLOCKED: Attempt to set ${key} = ${value}`);
        return;
    }
    return originalSessionSetItem.call(this, key, value);
};

// Override localStorage.setItem to prevent redirect flags
const originalLocalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    if (key === 'redirect_auth_attempt' || key === 'redirect_auth_time') {
        console.log(`🚫 BLOCKED: Attempt to set ${key} = ${value}`);
        return;
    }
    return originalLocalSetItem.call(this, key, value);
};

// Clear existing flags
console.log("🧹 Clearing all existing auth flags...");
['redirect_auth_attempt', 'redirect_auth_time', 'redirect_auth_success', 'authSuccess', 'firebase_user'].forEach(key => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
    console.log(`✅ Cleared ${key}`);
});

// Clear cookies
document.cookie.split(";").forEach(c => {
    const name = c.split("=")[0].trim();
    if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
});

console.log("✅ Emergency auth fix applied!");
console.log("✅ Redirect flag creation is now blocked");
console.log("✅ All existing flags cleared");
console.log("\n🎯 Try the Google login button now - it should work without creating persistent flags");

// Test function
window.testAuthState = function() {
    console.log("📊 Current auth state:");
    console.log("Redirect Attempt:", sessionStorage.getItem('redirect_auth_attempt') || localStorage.getItem('redirect_auth_attempt') || 'false');
    console.log("Redirect Time:", sessionStorage.getItem('redirect_auth_time') || localStorage.getItem('redirect_auth_time') || 'none');
    console.log("Auth Success:", sessionStorage.getItem('authSuccess') || 'false');
};

window.directAccess = function() {
    localStorage.setItem('emergency_access', 'true');
    window.location.href = '/industry-pulse';
};

console.log("Commands: testAuthState() | directAccess()");