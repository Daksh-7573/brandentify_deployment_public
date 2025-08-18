// DEBUG GOOGLE AUTHENTICATION - Copy to browser console
// This will test the authentication flow step by step

console.log("🔍 DEBUGGING GOOGLE AUTHENTICATION");
console.log("=".repeat(50));

// Test 1: Check if Firebase is loaded
console.log("TEST 1: Firebase modules...");
window.testFirebaseLoading = async function() {
    try {
        const { auth, googleProvider } = await import('/src/lib/firebase.ts');
        console.log("✅ Firebase auth loaded:", !!auth);
        console.log("✅ Google provider loaded:", !!googleProvider);
        console.log("Auth object:", auth);
        
        if (auth && auth.app) {
            console.log("✅ Firebase app configured:");
            console.log("- Project ID:", auth.app.options.projectId);
            console.log("- Auth Domain:", auth.app.options.authDomain);
            console.log("- API Key:", auth.app.options.apiKey ? "Present" : "Missing");
        }
        
        return { auth, googleProvider };
    } catch (error) {
        console.error("❌ Firebase loading error:", error);
        return null;
    }
};

// Test 2: Check Auth Context
console.log("TEST 2: Auth context...");
window.testAuthContext = function() {
    try {
        // Check if auth context is available
        const authButtons = document.querySelectorAll('[data-testid="google-auth-button"]');
        console.log("Google auth buttons found:", authButtons.length);
        
        if (authButtons.length > 0) {
            console.log("✅ Google auth button is present");
            return authButtons[0];
        } else {
            console.log("❌ Google auth button not found");
            return null;
        }
    } catch (error) {
        console.error("❌ Auth context error:", error);
        return null;
    }
};

// Test 3: Manual popup test
console.log("TEST 3: Manual popup test...");
window.testManualPopup = async function() {
    try {
        console.log("🚀 Testing manual Firebase popup...");
        
        const firebaseModules = await window.testFirebaseLoading();
        if (!firebaseModules) {
            console.log("❌ Cannot test - Firebase not loaded");
            return;
        }
        
        const { signInWithPopup } = await import('firebase/auth');
        const { auth, googleProvider } = firebaseModules;
        
        console.log("Starting manual popup test...");
        
        // Configure provider
        googleProvider.addScope('email');
        googleProvider.addScope('profile');
        googleProvider.setCustomParameters({
            prompt: 'select_account'
        });
        
        console.log("Opening popup...");
        const result = await signInWithPopup(auth, googleProvider);
        
        if (result && result.user) {
            console.log("🎉 MANUAL POPUP SUCCESS!");
            console.log("User:", result.user.email);
            console.log("Display Name:", result.user.displayName);
        }
        
    } catch (error) {
        console.error("❌ Manual popup failed:", error);
        
        if (error.code === 'auth/popup-blocked') {
            console.log("💡 SOLUTION: Popup was blocked - enable popups for this domain");
        } else if (error.code === 'auth/popup-closed-by-user') {
            console.log("💡 INFO: User closed the popup before completing authentication");
        } else {
            console.log("💡 ERROR CODE:", error.code);
            console.log("💡 ERROR MESSAGE:", error.message);
        }
    }
};

// Test 4: Check button click handler
console.log("TEST 4: Button click test...");
window.testButtonClick = function() {
    const button = document.querySelector('[data-testid="google-auth-button"]');
    if (button) {
        console.log("✅ Button found, simulating click...");
        button.click();
        console.log("Button clicked - check console for authentication logs");
    } else {
        console.log("❌ Google auth button not found");
        console.log("Available buttons:", document.querySelectorAll('button'));
    }
};

// Test 5: Environment check
console.log("TEST 5: Environment variables...");
window.testEnvironment = function() {
    console.log("Environment variables:");
    console.log("- VITE_FIREBASE_API_KEY:", import.meta.env.VITE_FIREBASE_API_KEY ? "Present" : "Missing");
    console.log("- VITE_FIREBASE_PROJECT_ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID || "Missing");
    console.log("- VITE_FIREBASE_APP_ID:", import.meta.env.VITE_FIREBASE_APP_ID ? "Present" : "Missing");
    
    console.log("Current domain:", window.location.hostname);
    console.log("Protocol:", window.location.protocol);
    console.log("Full URL:", window.location.href);
};

// Run basic tests automatically
console.log("🔄 RUNNING AUTOMATIC TESTS...");

// Test environment first
window.testEnvironment();

// Test Firebase loading
window.testFirebaseLoading().then(() => {
    console.log("Firebase test completed");
});

// Test auth context
window.testAuthContext();

console.log("\n🔧 MANUAL TEST COMMANDS:");
console.log("- testFirebaseLoading() - Test Firebase module loading");
console.log("- testAuthContext() - Check auth context and buttons");  
console.log("- testManualPopup() - Test Firebase popup directly");
console.log("- testButtonClick() - Simulate button click");
console.log("- testEnvironment() - Check environment variables");

console.log("\n💡 NEXT STEPS:");
console.log("1. Run testManualPopup() to test Firebase directly");
console.log("2. Run testButtonClick() to test the button");
console.log("3. Check browser console for any errors");
console.log("4. Make sure popups are enabled for this domain");