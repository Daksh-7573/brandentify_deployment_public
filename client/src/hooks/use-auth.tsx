// Re-export the useAuth hook from the auth context
import { useAuth as useAuthContext } from '../context/auth-context';

export const useAuth = useAuthContext;