
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type HealthcareRole = 'doctor' | 'nurse' | 'therapist' | 'cna' | 'admin';

export const useRolePermissions = () => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<HealthcareRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user roles
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user?.id) {
        setUserRoles([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Use the Edge Function to fetch user roles
        const { data, error } = await supabase.functions.invoke('get-user-roles', {
          body: { userId: user.id }
        });

        if (error) {
          throw error;
        }

        // Extract roles from the data
        const roles = data?.roles || [];
        setUserRoles(roles);
      } catch (err) {
        console.error('Error fetching user roles:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch user roles'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();
  }, [user?.id]);

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
      // Use Edge Function to check patient assignment
      const { data, error } = await supabase.functions.invoke('check-patient-assignment', {
        body: { 
          staffId: user.id,
          patientId: patientId
        }
      });

      if (error) throw error;
      return !!data?.isAssigned;
    } catch (err) {
      console.error('Error checking patient assignment:', err);
      return false;
    }
  }, [user?.id]);

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
      // Use Edge Function to assign a staff to a patient
      const { data, error } = await supabase.functions.invoke('assign-to-patient', {
        body: {
          staffId: staffId,
          patientId: patientId,
          role: role,
          assignedBy: user.id
        }
      });

      if (error) throw error;
      
      toast.success(`Staff member assigned to patient successfully`);
      return data;
    } catch (err) {
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
      // Use Edge Function to remove staff from a patient
      const { error } = await supabase.functions.invoke('remove-from-patient', {
        body: { assignmentId }
      });

      if (error) throw error;
      
      toast.success('Staff member removed from care team');
      return true;
    } catch (err) {
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
