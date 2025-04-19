
import { useAuth as originalUseAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRolePermissions } from './useRolePermissions';

// Extend the original useAuth hook to include admin user checking
export const useAuth = () => {
  const auth = originalUseAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const { hasRole, userRoles } = useRolePermissions();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // This is a direct check for the admin email
        if (auth.user?.email === "tdicusmurray@gmail.com") {
          setIsAdmin(true);
          return;
        }
        
        // Role-based check
        if (auth.user) {
          const isUserAdmin = hasRole('admin');
          setIsAdmin(isUserAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [auth.user, hasRole, userRoles]);
  
  return {
    ...auth,
    isAdmin
  };
};
