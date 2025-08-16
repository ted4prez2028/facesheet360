
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type HealthcareRole = 'doctor' | 'nurse' | 'therapist' | 'cna' | 'admin' | 'patient';

// Define types for the missing tables
interface UserRole {
  role: HealthcareRole;
  user_id: string;
}

interface CareTeamAssignment {
  id: string;
  staff_id: string;
  patient_id: string;
  role: HealthcareRole;
  assigned_by: string;
  active: boolean;
}

export const useRolePermissions = () => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<HealthcareRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user roles
  const fetchUserRoles = useCallback(async () => {
    if (!user?.id) {
      setUserRoles([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Check if the user is authenticated
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error(`Authentication error: ${sessionError?.message || 'No active session'}`);
      }
      
      // Use the Edge Function to fetch user roles
      const { data, error } = await supabase.functions.invoke('get-user-roles', {
        body: { userId: user.id }
      });

      if (error) {
        console.error("Edge function error:", error);
        
        // Fall back to direct query as a backup method
        try {
          console.log("Falling back to direct query for user roles");
          
          // We'll try to get the user's role from the users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
              
          if (userError) {
            throw userError;
          }
          
          // If user has a role in the users table, use that
          if (userData?.role) {
            setUserRoles([userData.role as HealthcareRole]);
            setIsLoading(false);
            return;
          }
          
          throw new Error("Could not retrieve user roles");
        } catch (directErr: unknown) {
          console.error("Direct query fallback failed:", directErr);
          // If user is logged in but we can't retrieve roles, default to patient role
          setUserRoles(['patient']);
          setIsLoading(false);
          return;
        }
      }

      // Extract roles from the data
      const roles = data?.roles || [];
      setUserRoles(roles);
    } catch (err: unknown) {
      console.error('Error fetching user roles:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user roles'));
      // Default to basic role if there's an error but user is logged in
      if (user) {
        setUserRoles(['patient']);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserRoles();
  }, [user?.id, fetchUserRoles]);

  // Check if user has a specific role
  const hasRole = useCallback((role: HealthcareRole): boolean => {
    return userRoles.includes(role);
  }, [userRoles]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles: HealthcareRole[]): boolean => {
    return roles.some(role => userRoles.includes(role));
  }, [userRoles]);

  // Check if user is assigned to a patient
  const isAssignedToPatient = useCallback(async (patientId: string): Promise<boolean> => {
    if (!user?.id || !patientId) return false;

    try {
      // Check if the user is authenticated
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error("Authentication required for checking patient assignment");
        return false;
      }
      
      // Check if user is admin or doctor (has access to all patients)
      if (userRoles.includes('admin') || userRoles.includes('doctor')) {
        return true;
      }
      
      // Use Edge Function to check patient assignment
      const { data, error } = await supabase.functions.invoke('check-patient-assignment', {
        body: { 
          staffId: user.id,
          patientId: patientId
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        // Since we can't query directly, return false as a safe default
        return false;
      }

      return !!data?.isAssigned;
    } catch (err: unknown) {
      console.error('Error checking patient assignment:', err);
      return false;
    }
  }, [user?.id, userRoles]);

  // Assign a user to a patient
  const assignToPatient = useCallback(async (
    staffId: string,
    patientId: string,
    role: HealthcareRole
  ) => {
    if (!user?.id) {
      toast.error('You must be logged in to assign staff to patients');
      return null;
    }

    // Check if the current user has permission to assign
    if (!hasRole('doctor') && !hasRole('admin')) {
      toast.error('You do not have permission to assign staff to patients');
      return null;
    }

    try {
      // Check if the user is authenticated
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error(`Authentication error: ${sessionError?.message || 'No active session'}`);
      }
      
      // Use edge function
      const { data: funcData, error: funcError } = await supabase.functions.invoke('assign-to-patient', {
        body: { 
          staffId,
          patientId,
          role,
          assignedBy: user.id
        }
      });
      
      if (funcError) {
        console.error("Edge function error:", funcError);
        throw funcError;
      }
      
      toast.success(`Staff member assigned to patient successfully`);
      return funcData;
    } catch (err: unknown) {
      console.error('Error assigning staff to patient:', err);
      toast.error('Failed to assign staff to patient');
      return null;
    }
  }, [user?.id, hasRole]);

  // Remove a user from a patient's care team
  const removeFromPatient = useCallback(async (assignmentId: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to modify care team assignments');
      return false;
    }

    // Check if the current user has permission
    if (!hasRole('doctor') && !hasRole('admin')) {
      toast.error('You do not have permission to modify care team assignments');
      return false;
    }

    try {
      // Check if the user is authenticated
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error(`Authentication error: ${sessionError?.message || 'No active session'}`);
      }
      
      // Use edge function
      const { data: funcData, error: funcError } = await supabase.functions.invoke('remove-from-patient', {
        body: { assignmentId }
      });
      
      if (funcError) {
        console.error("Edge function error:", funcError);
        throw funcError;
      }
      
      toast.success('Staff member removed from care team');
      return true;
    } catch (err: unknown) {
      console.error('Error removing staff from care team:', err);
      toast.error('Failed to remove staff from care team');
      return false;
    }
  }, [user?.id, hasRole]);

  return {
    userRoles,
    hasRole,
    hasAnyRole,
    isAssignedToPatient,
    assignToPatient,
    removeFromPatient,
    isLoading,
    error
  };
};
