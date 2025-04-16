
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Immunization {
  id: string;
  patient_id: string;
  vaccine: string;
  cvx_code?: string;
  status: string;
  source?: string;
  date_administered?: string;
  created_at: string;
  updated_at: string;
}

export function useImmunizations(patientId: string) {
  const queryClient = useQueryClient();

  const { data: immunizations, isLoading } = useQuery({
    queryKey: ['immunizations', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('immunizations')
        .select('*')
        .eq('patient_id', patientId)
        .order('date_administered', { ascending: false });

      if (error) throw error;
      return data as Immunization[];
    }
  });

  const addImmunization = useMutation({
    mutationFn: async (immunization: Omit<Immunization, 'id' | 'created_at' | 'updated_at'>) => {
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
    onError: (error) => {
      toast.error('Failed to add immunization');
      console.error('Error adding immunization:', error);
    }
  });

  const updateImmunization = useMutation({
    mutationFn: async ({ id, ...immunization }: Partial<Immunization> & { id: string }) => {
      const { data, error } = await supabase
        .from('immunizations')
        .update(immunization)
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
    onError: (error) => {
      toast.error('Failed to update immunization');
      console.error('Error updating immunization:', error);
    }
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
    onError: (error) => {
      toast.error('Failed to delete immunization');
      console.error('Error deleting immunization:', error);
    }
  });

  return {
    immunizations,
    isLoading,
    addImmunization,
    updateImmunization,
    deleteImmunization
  };
}
