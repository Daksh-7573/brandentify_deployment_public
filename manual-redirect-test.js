// MANUAL REDIRECT TEST - Test redirect after successful authentication
// Copy to browser console after successful Google authentication

console.log("🧪 MANUAL REDIRECT TEST - Testing post-auth redirect");

function testManualRedirect() {
    console.log("Current location:", window.location.href);
    console.log("Current pathname:", window.location.pathname);
    
    // Method 1: Direct location change
    console.log("Method 1: Direct location.href change");
    setTimeout(() => {
        window.location.href = '/industry-pulse';
    }, 1000);
    
    // Method 2: History API + location change (backup)
    setTimeout(() => {
        console.log("Method 2: History + location backup");
        window.history.pushState(null, '', '/industry-pulse');
        window.location.reload();
    }, 3000);
}

// Test immediate redirect
console.log("Testing immediate redirect...");
testManualRedirect();

// Alternative direct redirect function
window.forceRedirectToIndustryPulse = function() {
    console.log("🚀 Forcing redirect to Industry Pulse...");
    window.location.href = '/industry-pulse';
};

console.log("Available commands:");
console.log("- forceRedirectToIndustryPulse() - Force redirect to Industry Pulse");
console.log("- Auto-redirect will attempt in 1 second...");