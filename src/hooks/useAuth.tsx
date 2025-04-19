
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
      if (auth.user?.email === "tdicusmurray@gmail.com") {
        setIsAdmin(true);
        return;
      }
      
      setIsAdmin(hasRole('admin'));
    };
    
    if (auth.user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [auth.user, hasRole, userRoles]);
  
  return {
    ...auth,
    isAdmin
  };
};
