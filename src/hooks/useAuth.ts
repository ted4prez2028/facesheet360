
import { useAuth as originalUseAuth } from '@/context/AuthContext';

// Re-export the useAuth hook from the AuthContext
export const useAuth = originalUseAuth;
