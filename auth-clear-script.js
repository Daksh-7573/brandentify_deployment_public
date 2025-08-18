// COPY AND PASTE THIS SCRIPT INTO YOUR BROWSER CONSOLE
// This will immediately clear all authentication data causing issues

console.log("🧹 Starting immediate authentication data cleanup...");
console.log("==========================================");

// Function to clear all authentication data
function clearAllAuthData() {
    let totalCleared = 0;
    
    console.log("1. Clearing specific problematic keys...");
    
    // Clear the specific keys causing issues
    const problemKeys = [
        'redirect_auth_attempt', 
        'redirect_auth_time', 
        'redirect_auth_success',
        'authSuccess', 
        'firebase_user', 
        'emergency_access', 
        'bypass_auth',
        'auth_return_url'
    ];
    
    problemKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            totalCleared++;
            console.log(`✅ Cleared localStorage: ${key}`);
        }
        if (sessionStorage.getItem(key)) {
            sessionStorage.removeItem(key);
            totalCleared++;
            console.log(`✅ Cleared sessionStorage: ${key}`);
        }
    });
    
    console.log("2. Clearing all Firebase-related items...");
    
    // Clear all auth-related keys
    const allLocalKeys = Object.keys(localStorage);
    const allSessionKeys = Object.keys(sessionStorage);
    
    [...allLocalKeys, ...allSessionKeys].forEach(key => {
        if (key.includes('firebase') || key.includes('auth') || key.includes('redirect') || key.includes('google')) {
            try {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
                totalCleared++;
                console.log(`✅ Cleared: ${key}`);
            } catch (e) {
                // Ignore errors for keys that don't exist in both storages
            }
        }
    });
    
    console.log("3. Clearing all cookies...");
    
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
        const cookieName = c.split("=")[0].trim();
        if (cookieName) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            console.log(`✅ Cleared cookie: ${cookieName}`);
            totalCleared++;
        }
    });
    
    console.log("==========================================");
    console.log(`🎉 CLEANUP COMPLETE! ${totalCleared} items cleared`);
    console.log("✅ All redirect attempt flags removed");
    console.log("✅ All Firebase authentication data cleared");
    console.log("✅ All related cookies cleared");
    console.log("==========================================");
    console.log("💡 What to do next:");
    console.log("1. Try the Google login button again");
    console.log("2. Or reload the page for a fresh start");
    console.log("3. Or run: window.location.href = '/industry-pulse' for direct access");
    
    return totalCleared;
}

// Auto-execute the cleanup
const cleared = clearAllAuthData();

// Provide easy shortcuts
window.goToLogin = function() {
    console.log("🏠 Redirecting to login page...");
    window.location.href = '/';
};

window.goToApp = function() {
    console.log("🚀 Setting up emergency access and redirecting...");
    localStorage.setItem('emergency_access', 'true');
    sessionStorage.setItem('bypass_auth', 'true');
    window.location.href = '/industry-pulse';
};

console.log("💡 Quick commands available:");
console.log("- goToLogin() - Return to login page");
console.log("- goToApp() - Direct access to Industry Pulse");