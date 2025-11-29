import { useContext } from 'react';
import { AuthContext } from '@/context/simple-auth-context';

/**
 * Hook to access simplified server-session authentication context
 * Provides user data, authentication state, and auth functions
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
