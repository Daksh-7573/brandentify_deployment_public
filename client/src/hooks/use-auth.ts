import { useAuth as useSimpleAuth } from '@/context/simple-auth-context';

/**
 * Hook to access authentication context throughout the application
 * Provides user data, authentication state, and auth functions
 */
export function useAuth() {
  return useSimpleAuth();
}