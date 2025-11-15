import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Allergy {
  id: string;
  patient_id: string;
  allergen: string;
  reaction: string;
  severity: string;
  date_identified: string;
  status: string;
  type: string;
  category?: string;
  recorded_at?: string;
  recorded_by?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export function useAllergies(patientId: string) {
  const queryClient = useQueryClient();

  const { data: allergies = [], isLoading } = useQuery({
    queryKey: ['allergies', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('allergies')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(allergy => ({
        ...allergy,
        type: 'Allergy',
        category: allergy.severity === 'severe' ? 'Critical' : 'Standard',
        date_identified: allergy.recorded_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        status: 'active'
      })) as Allergy[];
    },
    enabled: !!patientId
  });

  const addAllergy = async (newAllergy: Omit<Allergy, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('allergies')
        .insert({
          patient_id: newAllergy.patient_id || patientId,
          allergen: newAllergy.allergen,
          reaction: newAllergy.reaction,
          severity: newAllergy.severity,
          recorded_at: newAllergy.date_identified || new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['allergies', patientId] });
      toast.success('Allergy added successfully');
      return data;
    } catch (error) {
      console.error('Error adding allergy:', error);
      toast.error('Failed to add allergy');
      throw error;
    }
  };

  const updateAllergy = async (id: string, updatedAllergy: Partial<Allergy>) => {
    try {
      const { data, error } = await supabase
        .from('allergies')
        .update({
          allergen: updatedAllergy.allergen,
          reaction: updatedAllergy.reaction,
          severity: updatedAllergy.severity,
          recorded_at: updatedAllergy.date_identified
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['allergies', patientId] });
      toast.success('Allergy updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating allergy:', error);
      toast.error('Failed to update allergy');
      throw error;
    }
  };

  const deleteAllergy = async (id: string) => {
    try {
      const { error } = await supabase
        .from('allergies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['allergies', patientId] });
      toast.success('Allergy deleted successfully');
    } catch (error) {
      console.error('Error deleting allergy:', error);
      toast.error('Failed to delete allergy');
      throw error;
    }
  };

  return {
    allergies,
    isLoading,
    addAllergy,
    updateAllergy,
    deleteAllergy,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['allergies', patientId] })
  };
}
