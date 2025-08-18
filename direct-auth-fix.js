// Direct JavaScript solution to clear stuck auth data
console.log("🔧 Direct Auth Fix Tool Loading...");

// Check current auth status
const redirectAttempt = sessionStorage.getItem('redirect_auth_attempt') === 'true';
const redirectTime = sessionStorage.getItem('redirect_auth_time');
const authSuccess = sessionStorage.getItem('authSuccess') === 'true';

console.log("📊 Current Auth Status:");
console.log("- Redirect Attempt:", redirectAttempt ? "TRUE (STUCK)" : "false");
console.log("- Redirect Time:", redirectTime || "none");
console.log("- Auth Success:", authSuccess ? "true" : "FALSE");

if (redirectAttempt && !authSuccess) {
    console.log("⚠️ PROBLEM DETECTED: Stuck redirect attempt without success");
    console.log("🔧 Clearing stuck authentication data...");
    
    let cleared = [];
    
    // Clear the exact stuck flags
    if (sessionStorage.getItem('redirect_auth_attempt')) {
        sessionStorage.removeItem('redirect_auth_attempt');
        cleared.push('redirect_auth_attempt');
    }
    
    if (sessionStorage.getItem('redirect_auth_time')) {
        sessionStorage.removeItem('redirect_auth_time');
        cleared.push('redirect_auth_time');
    }
    
    if (localStorage.getItem('redirect_auth_attempt')) {
        localStorage.removeItem('redirect_auth_attempt');
        cleared.push('redirect_auth_attempt (local)');
    }
    
    if (localStorage.getItem('redirect_auth_time')) {
        localStorage.removeItem('redirect_auth_time');
        cleared.push('redirect_auth_time (local)');
    }
    
    // Clear other auth flags
    ['authSuccess', 'redirect_auth_success', 'auth_return_url'].forEach(key => {
        if (sessionStorage.getItem(key)) {
            sessionStorage.removeItem(key);
            cleared.push(key);
        }
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            cleared.push(key + ' (local)');
        }
    });
    
    console.log("✅ FIXED: Cleared", cleared.length, "stuck flags:", cleared.join(', '));
    console.log("🎉 Authentication system is now reset");
    console.log("💡 You can now try Google login again");
    
    // Show success message on page
    document.body.innerHTML = `
        <div style="font-family: Arial; max-width: 500px; margin: 50px auto; padding: 30px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 10px; text-align: center;">
            <h2 style="color: #155724; margin: 0 0 20px 0;">✅ Authentication Fixed!</h2>
            <p style="color: #155724; margin: 10px 0;">Cleared ${cleared.length} stuck authentication flags</p>
            <p style="color: #155724; margin: 10px 0;">You can now try Google login again</p>
            <button onclick="window.location.href='/'" style="padding: 12px 24px; background: #28a745; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin: 10px;">Go to Login Page</button>
            <button onclick="window.location.href='/industry-pulse'" style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin: 10px;">Go to Industry Pulse</button>
        </div>
    `;
} else {
    console.log("ℹ️ No authentication issues detected");
    document.body.innerHTML = `
        <div style="font-family: Arial; max-width: 500px; margin: 50px auto; padding: 30px; background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 10px; text-align: center;">
            <h2 style="color: #0c5460; margin: 0 0 20px 0;">ℹ️ Auth Status Check</h2>
            <p style="color: #0c5460; margin: 10px 0;">No stuck authentication flags found</p>
            <p style="color: #0c5460; margin: 10px 0;">Authentication system appears clean</p>
            <button onclick="window.location.href='/'" style="padding: 12px 24px; background: #17a2b8; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin: 10px;">Go to Login Page</button>
        </div>
    `;
}
