import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Immunization {
  id?: string;
  patient_id: string;
  vaccine_name: string;
  cvx_code?: string;
  date_administered?: string;
  status: string;
  source?: string;
  administered_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const useImmunizations = (patientId: string) => {
  const queryClient = useQueryClient();

  const { data: immunizations = [], isLoading } = useQuery({
    queryKey: ['immunizations', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('immunizations')
        .select('*')
        .eq('patient_id', patientId)
        .order('date_administered', { ascending: false });

      if (error) throw error;
      return data as Immunization[];
    },
    enabled: !!patientId,
  });

  const addImmunization = useMutation({
    mutationFn: async (immunization: Omit<Immunization, 'id'>) => {
      const { data, error } = await supabase
        .from('immunizations')
        .insert(immunization)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['immunizations', patientId] });
      toast.success('Immunization added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add immunization: ${error.message}`);
    },
  });

  const updateImmunization = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Immunization> & { id: string }) => {
      const { data, error } = await supabase
        .from('immunizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['immunizations', patientId] });
      toast.success('Immunization updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update immunization: ${error.message}`);
    },
  });

  const deleteImmunization = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('immunizations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['immunizations', patientId] });
      toast.success('Immunization deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete immunization: ${error.message}`);
    },
  });

  return {
    immunizations,
    isLoading,
    addImmunization,
    updateImmunization,
    deleteImmunization,
  };
};
