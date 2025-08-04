/**
 * Dedicated authentication redirect handler utility
 * This provides a centralized way to handle Google OAuth redirect results
 */

export async function checkAndHandleAuthRedirect(): Promise<boolean> {
  console.log("🔍 Checking for Google auth redirect result...");
  
  try {
    // Import Firebase functions dynamically
    const { getRedirectResult } = await import('firebase/auth');
    const { auth } = await import('@/lib/firebase');
    
    if (!auth) {
      console.log("❌ Firebase auth not initialized");
      return false;
    }
    
    // Check for redirect result  
    const result = await getRedirectResult(auth as any);
    
    if (result && result.user) {
      console.log("🎉 REDIRECT SUCCESS: Found authenticated user:", result.user.email);
      
      // Clear any existing attempt flags
      sessionStorage.removeItem('redirect_auth_attempt');
      sessionStorage.removeItem('redirect_auth_time');
      
      // Set success flags
      sessionStorage.setItem('authSuccess', 'true');
      sessionStorage.setItem('user_authenticated', 'true');
      
      // Store user info
      sessionStorage.setItem('current_user', JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      }));
      
      console.log("✅ User authentication successful, redirecting to industry pulse...");
      
      // Redirect to industry pulse page
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/industry-pulse';
        }
      }, 500);
      
      return true;
      
    } else {
      console.log("❌ No redirect result found");
      return false;
    }
    
  } catch (error: any) {
    console.error("❌ Error handling auth redirect:", error);
    
    // Clear attempt flags on error
    sessionStorage.removeItem('redirect_auth_attempt');
    sessionStorage.removeItem('redirect_auth_time');
    
    return false;
  }
}

/**
 * Initialize redirect checking on page load
 */
export function initializeRedirectHandler() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Check if we have a redirect attempt flag
  const hasRedirectAttempt = sessionStorage.getItem('redirect_auth_attempt') === 'true';
  
  console.log("🔧 initializeRedirectHandler: hasRedirectAttempt =", hasRedirectAttempt);
  
  if (hasRedirectAttempt) {
    console.log("📍 Found redirect attempt flag - initializing handler");
    
    // Check immediately
    checkAndHandleAuthRedirect();
    
    // Also check periodically for up to 10 seconds
    let attempts = 0;
    const maxAttempts = 10;
    
    const interval = setInterval(async () => {
      attempts++;
      console.log(`🔄 Redirect check attempt ${attempts}/${maxAttempts}`);
      
      const success = await checkAndHandleAuthRedirect().catch(() => false);
      
      if (success || attempts >= maxAttempts) {
        clearInterval(interval);
        
        if (!success && attempts >= maxAttempts) {
          console.log("⚠️ Max redirect check attempts reached, cleaning up flags");
          sessionStorage.removeItem('redirect_auth_attempt');
          sessionStorage.removeItem('redirect_auth_time');
        }
      }
    }, 1000);
  } else {
    console.log("❌ No redirect attempt flag found - not initializing handler");
  }
}