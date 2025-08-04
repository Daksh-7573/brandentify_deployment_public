// Enhanced authentication helper for handling redirect results and state management

export interface AuthResult {
  success: boolean;
  user?: {
    uid: string;
    email: string;
    displayName?: string;
  };
  error?: string;
  method?: 'redirect' | 'popup';
}

// Check for redirect result with comprehensive error handling
export async function checkAuthRedirectResult(): Promise<AuthResult> {
  try {
    console.log("🔍 Checking for Firebase redirect result...");
    
    const { getRedirectResult } = await import('firebase/auth');
    const { auth } = await import('@/lib/firebase');
    
    // First check if user is already authenticated
    if (auth.currentUser) {
      console.log("✅ User already authenticated:", auth.currentUser.email);
      return {
        success: true,
        user: {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email || '',
          displayName: auth.currentUser.displayName || undefined
        },
        method: 'redirect'
      };
    }
    
    // Check for redirect result
    const result = await getRedirectResult(auth);
    
    if (result && result.user) {
      console.log("🎉 Redirect result found:", result.user.email);
      
      // Set success flags in session storage
      sessionStorage.setItem('authSuccess', 'true');
      sessionStorage.setItem('redirect_auth_success', JSON.stringify({
        email: result.user.email,
        uid: result.user.uid,
        timestamp: new Date().toISOString()
      }));
      
      // Clear attempt flags
      sessionStorage.removeItem('redirect_auth_attempt');
      sessionStorage.removeItem('redirect_auth_time');
      
      return {
        success: true,
        user: {
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || undefined
        },
        method: 'redirect'
      };
    }
    
    console.log("❌ No redirect result found");
    return { success: false };
    
  } catch (error: any) {
    console.error("Error checking redirect result:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Initiate Google sign-in with redirect
export async function signInWithGoogleRedirect(): Promise<void> {
  try {
    console.log("🚀 Starting Google redirect authentication...");
    
    const { signInWithRedirect } = await import('firebase/auth');
    const { auth, googleProvider } = await import('@/lib/firebase');
    
    // Set attempt flags for debugging
    sessionStorage.setItem('redirect_auth_attempt', 'true');
    sessionStorage.setItem('redirect_auth_time', new Date().toISOString());
    
    console.log("🔄 Redirecting to Google...");
    await signInWithRedirect(auth, googleProvider);
    
  } catch (error: any) {
    console.error("Redirect authentication failed:", error);
    throw error;
  }
}

// Initiate Google sign-in with popup (fallback)
export async function signInWithGooglePopup(): Promise<AuthResult> {
  try {
    console.log("🚀 Starting Google popup authentication...");
    
    const { signInWithPopup } = await import('firebase/auth');
    const { auth, googleProvider } = await import('@/lib/firebase');
    
    console.log("📱 Opening popup...");
    const result = await signInWithPopup(auth, googleProvider);
    
    if (result.user) {
      console.log("✅ Popup authentication successful:", result.user.email);
      
      // Set success flags
      sessionStorage.setItem('authSuccess', 'true');
      sessionStorage.setItem('popup_auth_success', JSON.stringify({
        email: result.user.email,
        uid: result.user.uid,
        timestamp: new Date().toISOString()
      }));
      
      return {
        success: true,
        user: {
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || undefined
        },
        method: 'popup'
      };
    }
    
    throw new Error("No user returned from popup");
    
  } catch (error: any) {
    console.error("Popup authentication failed:", error);
    return { 
      success: false, 
      error: error.message,
      method: 'popup'
    };
  }
}

// Check if we should attempt redirect result check based on URL or session
export function shouldCheckRedirectResult(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  const hasAuthParams = urlParams.has('code') || urlParams.has('state') || urlParams.has('error');
  const hasRedirectAttempt = sessionStorage.getItem('redirect_auth_attempt') === 'true';
  
  return hasAuthParams || hasRedirectAttempt;
}

// Clear all authentication attempt flags
export function clearAuthAttemptFlags(): void {
  sessionStorage.removeItem('redirect_auth_attempt');
  sessionStorage.removeItem('redirect_auth_time');
  sessionStorage.removeItem('popup_auth_attempt');
  sessionStorage.removeItem('popup_auth_time');
}

// Get authentication state summary for debugging
export function getAuthStateSummary(): Record<string, any> {
  return {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    urlParams: Object.fromEntries(new URLSearchParams(window.location.search)),
    sessionFlags: {
      authSuccess: sessionStorage.getItem('authSuccess'),
      redirectAttempt: sessionStorage.getItem('redirect_auth_attempt'),
      redirectTime: sessionStorage.getItem('redirect_auth_time'),
      redirectSuccess: sessionStorage.getItem('redirect_auth_success'),
      popupSuccess: sessionStorage.getItem('popup_auth_success')
    },
    shouldCheckRedirect: shouldCheckRedirectResult()
  };
}