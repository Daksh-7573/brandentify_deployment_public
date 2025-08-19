/**
 * Instant Demo Access Utility
 * Provides immediate app access when Google OAuth fails
 */

export interface DemoUser {
  id: number;
  email: string;
  name: string;
  username: string;
  photoURL: string;
  emailVerified: boolean;
  authProvider: string;
}

export function createInstantDemoAccess(): DemoUser {
  const timestamp = Date.now();
  const demoUser: DemoUser = {
    id: timestamp,
    email: 'demo@brandentifier.com',
    name: 'Demo User',
    username: 'demo',
    photoURL: '',
    emailVerified: true,
    authProvider: 'demo_bypass'
  };

  // Set authentication state
  localStorage.setItem('auth_bypass', 'true');
  localStorage.setItem('demo_user', JSON.stringify(demoUser));
  sessionStorage.setItem('authSuccess', 'true');
  sessionStorage.setItem('userAuthenticated', 'true');
  
  console.log('✅ Demo access granted - bypassing Firebase OAuth');
  
  // Trigger authentication event
  const authEvent = new CustomEvent('authStateChanged', { 
    detail: { 
      isAuthenticated: true, 
      user: demoUser,
      bypass: true
    }
  });
  window.dispatchEvent(authEvent);
  
  return demoUser;
}

export function navigateToApp(): void {
  console.log('🚀 Navigating to Industry Pulse...');
  
  // Add small delay for visual feedback
  setTimeout(() => {
    window.location.href = '/industry-pulse';
  }, 1000);
}

export function setupInstantDemoAccess(): void {
  createInstantDemoAccess();
  navigateToApp();
}