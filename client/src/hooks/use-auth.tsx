// Re-export the useAuth hook from the clean auth context
import { useAuth as useAuthContext } from '../context/auth-context-clean';

export const useAuth = useAuthContext;