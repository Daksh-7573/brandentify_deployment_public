import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context';

/**
 * Hook to access authentication context throughout the application
 * Provides user data, authentication state, and auth functions
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}