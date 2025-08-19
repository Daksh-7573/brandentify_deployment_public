// Re-export the useAuth hook from the simple auth context
import { useContext } from 'react';
import { AuthContext } from '../context/simple-auth-context';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Add helper properties for profile page
  return {
    ...context,
    uid: context.user?.username || context.user?.email || '',
    isReady: !context.isLoading && !!context.user
  };
};