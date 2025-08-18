// Immediate Authentication Data Cleaner
// Run this in the browser console to clear all auth data

console.log("🧹 Starting immediate auth data cleanup...");

let cleared = 0;

// Clear specific problematic keys
const specificKeys = [
    'redirect_auth_attempt', 
    'redirect_auth_time', 
    'redirect_auth_success',
    'authSuccess', 
    'firebase_user', 
    'emergency_access', 
    'bypass_auth',
    'auth_return_url'
];

console.log("Clearing specific auth keys...");
specificKeys.forEach(key => {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        cleared++;
        console.log(`✅ Cleared localStorage: ${key}`);
    }
    if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        cleared++;
        console.log(`✅ Cleared sessionStorage: ${key}`);
    }
});

// Clear all Firebase-related items
console.log("Clearing Firebase-related items...");
const allLocalKeys = Object.keys(localStorage);
const allSessionKeys = Object.keys(sessionStorage);

[...allLocalKeys, ...allSessionKeys].forEach(key => {
    if (key.includes('firebase') || key.includes('auth') || key.includes('redirect') || key.includes('google')) {
        try {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
            cleared++;
            console.log(`✅ Cleared auth-related: ${key}`);
        } catch (e) {
            // Ignore errors for keys that don't exist in both storages
        }
    }
});

// Clear cookies
console.log("Clearing cookies...");
document.cookie.split(";").forEach(function(c) { 
    const cookieName = c.split("=")[0].trim();
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    if (cookieName) {
        console.log(`✅ Cleared cookie: ${cookieName}`);
        cleared++;
    }
});

console.log(`🎉 Auth cleanup complete! ${cleared} items removed`);
console.log("✅ All redirect attempt flags cleared");
console.log("✅ All Firebase auth data cleared");
console.log("You can now try the Google login button again");

// Optionally redirect to login page
// window.location.href = '/';