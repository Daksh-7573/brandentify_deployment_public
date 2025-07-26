// Re-export the useAuth hook from the fixed auth context
import { useAuth as useAuthContext } from '../context/auth-context-fixed';

export const useAuth = useAuthContext;