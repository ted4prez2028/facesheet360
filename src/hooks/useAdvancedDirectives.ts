
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdvancedDirective {
  id: string;
  patient_id: string;
  directive_type: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  start_date: string;
  end_date?: string;
  created_by?: string;
}

export function useAdvancedDirectives(patientId: string) {
  const queryClient = useQueryClient();

  const { data: directives, isLoading } = useQuery({
    queryKey: ['advanced-directives', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advanced_directives')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdvancedDirective[];
    }
  });

  const addDirective = useMutation({
    mutationFn: async (directive: Omit<AdvancedDirective, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('advanced_directives')
        .insert(directive)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-directives', patientId] });
      toast.success('Advanced directive added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add advanced directive');
      console.error('Error adding advanced directive:', error);
    }
  });

  const updateDirective = useMutation({
    mutationFn: async ({ id, ...directive }: Partial<AdvancedDirective> & { id: string }) => {
      const { data, error } = await supabase
        .from('advanced_directives')
        .update(directive)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-directives', patientId] });
      toast.success('Advanced directive updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update advanced directive');
      console.error('Error updating advanced directive:', error);
    }
  });

  const deleteDirective = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('advanced_directives')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-directives', patientId] });
      toast.success('Advanced directive deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete advanced directive');
      console.error('Error deleting advanced directive:', error);
    }
  });

  return {
    directives,
    isLoading,
    addDirective,
    updateDirective,
    deleteDirective
  };
}
