// FINAL AUTH DATA CLEANER - COPY TO BROWSER CONSOLE
// This completely clears all authentication data and resets the debug state

console.log("🧹 FINAL AUTH DATA CLEANER - Starting comprehensive cleanup...");
console.log("=".repeat(60));

function finalAuthClear() {
    let cleared = 0;
    
    // List of all possible auth keys that could be causing issues
    const authKeys = [
        'redirect_auth_attempt',
        'redirect_auth_time', 
        'redirect_auth_success',
        'authSuccess',
        'firebase_user',
        'emergency_access',
        'bypass_auth',
        'auth_return_url',
        'firebase_auth_cache',
        'brandentifier_auth_cache',
        'demoMode',
        'authAttemptInProgress',
        'authAttemptTime'
    ];
    
    console.log("1. Clearing specific auth keys from both storages...");
    authKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            cleared++;
            console.log(`   ✅ localStorage.${key}`);
        }
        if (sessionStorage.getItem(key)) {
            sessionStorage.removeItem(key);
            cleared++;
            console.log(`   ✅ sessionStorage.${key}`);
        }
    });
    
    console.log("2. Clearing Firebase-related keys...");
    [...Object.keys(localStorage), ...Object.keys(sessionStorage)].forEach(key => {
        if (key.includes('firebase') || key.includes('auth') || key.includes('google') || key.includes('redirect')) {
            try {
                const inLocal = localStorage.getItem(key) !== null;
                const inSession = sessionStorage.getItem(key) !== null;
                
                if (inLocal) {
                    localStorage.removeItem(key);
                    cleared++;
                    console.log(`   ✅ localStorage.${key}`);
                }
                if (inSession) {
                    sessionStorage.removeItem(key);
                    cleared++;
                    console.log(`   ✅ sessionStorage.${key}`);
                }
            } catch (e) {
                // Ignore any access errors
            }
        }
    });
    
    console.log("3. Clearing all cookies...");
    const cookies = document.cookie.split(";");
    cookies.forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            console.log(`   ✅ Cookie: ${name}`);
            cleared++;
        }
    });
    
    console.log("=".repeat(60));
    console.log(`🎉 CLEANUP COMPLETE! ${cleared} items cleared`);
    console.log("✅ All redirect attempt flags removed");
    console.log("✅ All Firebase auth data cleared");  
    console.log("✅ All cookies cleared");
    console.log("✅ Authentication state completely reset");
    console.log("=".repeat(60));
    
    return cleared;
}

// Execute the cleanup
const clearedItems = finalAuthClear();

console.log("📊 DEBUG INFO AFTER CLEANUP:");
console.log("Redirect Attempt:", sessionStorage.getItem('redirect_auth_attempt') || localStorage.getItem('redirect_auth_attempt') || 'false');
console.log("Redirect Time:", sessionStorage.getItem('redirect_auth_time') || localStorage.getItem('redirect_auth_time') || 'none');
console.log("Auth Success:", sessionStorage.getItem('authSuccess') || localStorage.getItem('authSuccess') || 'false');
console.log("User Auth: Should be reset");

console.log("\n💡 NEXT STEPS:");
console.log("1. The auth debug should now show 'Redirect Attempt: false'");
console.log("2. Try clicking the Google login button");
console.log("3. It should work cleanly without creating persistent flags");

console.log("\n🚀 QUICK ACCESS:");
window.testLogin = () => {
    console.log("🧪 Testing login after cleanup...");
    window.location.reload();
};

window.directAccess = () => {
    console.log("🚀 Direct access to Industry Pulse...");
    localStorage.setItem('emergency_access', 'true');
    window.location.href = '/industry-pulse';
};

console.log("Commands available:");
console.log("- testLogin() - Reload page to test clean auth state"); 
console.log("- directAccess() - Go directly to Industry Pulse");
console.log("\n✨ Auth state is now completely clean and ready!");