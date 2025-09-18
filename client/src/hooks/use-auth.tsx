// Re-export the useAuth hook from the main auth context that validates server sessions
import { useContext } from 'react';
import { AuthContext } from '../context/auth-context';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Add helper properties for profile page
  return {
    ...context,
    uid: context.user?.uid || context.user?.id?.toString() || context.user?.email || '',
    isReady: !context.isLoading && !!context.user
  };
};