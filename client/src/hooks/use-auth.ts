import { useContext } from 'react';
import { AuthContext } from '@/context/google-auth-context';

/**
 * Hook to access Google-only authentication context
 * Provides user data, authentication state, and Google OAuth functions
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}