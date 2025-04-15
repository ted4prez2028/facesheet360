
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

export interface Allergy extends Tables['allergies']['Row'] {}

export function useAllergies(patientId: string) {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllergies = async () => {
    try {
      const { data, error } = await supabase
        .from('allergies')
        .select('*')
        .eq('patient_id', patientId)
        .order('date_identified', { ascending: false });

      if (error) throw error;
      setAllergies(data || []);
    } catch (error) {
      console.error('Error fetching allergies:', error);
      toast.error('Failed to load allergies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllergies();
  }, [patientId]);

  const addAllergy = async (newAllergy: Omit<Allergy, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('allergies')
        .insert({
          ...newAllergy, 
          patient_id: patientId
        })
        .select()
        .single();

      if (error) throw error;
      setAllergies(prev => [...prev, data]);
      toast.success('Allergy added successfully');
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
        .update(updatedAllergy)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setAllergies(prev => prev.map(allergy => 
        allergy.id === id ? data : allergy
      ));
      toast.success('Allergy updated successfully');
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
      setAllergies(prev => prev.filter(allergy => allergy.id !== id));
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
    refetch: fetchAllergies
  };
}
