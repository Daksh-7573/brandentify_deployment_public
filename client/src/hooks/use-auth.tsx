// Re-export the useAuth hook from the simple auth context
import { useContext } from 'react';
import { AuthContext } from '../context/simple-auth-context';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};