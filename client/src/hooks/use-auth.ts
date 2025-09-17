import { useContext } from 'react';
import { AuthContext } from '@/context/simple-auth-context';

/**
 * Hook to access authentication context
 * Provides user data, authentication state, and JWT OAuth functions
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Add Google OAuth sign-in function that uses the backend OAuth API
  const signInWithGoogle = async () => {
    console.log('🚀 [USE-AUTH] Starting Google OAuth sign-in process...');
    
    try {
      // Call backend OAuth endpoint to get OAuth URL
      const response = await fetch('/api/auth/google', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`OAuth URL request failed: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success || !data.oauthUrl) {
        throw new Error('Invalid OAuth response from server');
      }
      
      console.log('✅ [USE-AUTH] Got OAuth URL, redirecting to Google...');
      
      // Store auth attempt timestamp for completion detection
      sessionStorage.setItem('oauth_attempt_time', Date.now().toString());
      
      // Redirect to Google OAuth - the callback will handle JWT session creation
      window.location.href = data.oauthUrl;
      
    } catch (error: any) {
      console.error('❌ [USE-AUTH] Google OAuth error:', error);
      throw error;
    }
  };
  
  return {
    ...context,
    signInWithGoogle
  };
}