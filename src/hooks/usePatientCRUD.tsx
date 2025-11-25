import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logAuditEvent } from '@/lib/auditLogger';

/**
 * Comprehensive CRUD hook for all patient data types
 * Includes automatic HIPAA audit logging for all operations
 */

interface CRUDOptions {
  table: string;
  patientId?: string;
  queryKey: string[];
  successMessage?: {
    create?: string;
    update?: string;
    delete?: string;
  };
  auditType: {
    view: string;
    create: string;
    update: string;
    delete: string;
  };
}

export const usePatientCRUD = (options: CRUDOptions) => {
  const queryClient = useQueryClient();
  const { table, patientId, queryKey, successMessage, auditType } = options;

  // CREATE mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      
      // Log HIPAA audit event
      await logAuditEvent({
        eventType: auditType.create as any,
        patientId: patientId || data.patient_id,
        resourceId: result.id,
        actionDetails: {
          action: `${table} record created`,
          data: data
        }
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(successMessage?.create || 'Record created successfully');
    },
    onError: (error: any) => {
      console.error(`Error creating ${table}:`, error);
      toast.error(error.message || `Failed to create ${table} record`);
    }
  });

  // UPDATE mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log HIPAA audit event
      await logAuditEvent({
        eventType: auditType.update as any,
        patientId: patientId || data.patient_id,
        resourceId: id,
        actionDetails: {
          action: `${table} record updated`,
          changes: data
        }
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(successMessage?.update || 'Record updated successfully');
    },
    onError: (error: any) => {
      console.error(`Error updating ${table}:`, error);
      toast.error(error.message || `Failed to update ${table} record`);
    }
  });

  // DELETE mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Log BEFORE deletion
      await logAuditEvent({
        eventType: auditType.delete as any,
        patientId,
        resourceId: id,
        actionDetails: {
          action: `${table} record deleted`,
          warning: 'PERMANENT DELETION'
        }
      });

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(successMessage?.delete || 'Record deleted successfully');
    },
    onError: (error: any) => {
      console.error(`Error deleting ${table}:`, error);
      toast.error(error.message || `Failed to delete ${table} record`);
    }
  });

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  };
};
