// Re-export the useAuth hook from the simple auth context  
import { useAuth as useAuthContext } from '../context/simple-auth-context';

export const useAuth = useAuthContext;