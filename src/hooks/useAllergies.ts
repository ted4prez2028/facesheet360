
import { useState, useEffect, useCallback } from 'react';
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
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Index signature for DataItem compatibility
}

export function useAllergies(patientId: string) {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllergies = useCallback(async () => {
    try {
      // Mock data since allergies table doesn't exist
      const mockAllergies: Allergy[] = [
        {
          id: '1',
          patient_id: patientId,
          allergen: 'Penicillin',
          reaction: 'Rash, difficulty breathing',
          severity: 'severe',
          date_identified: '2023-01-15',
          status: 'active',
          type: 'Drug Allergy',
          category: 'Medication',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          patient_id: patientId,
          allergen: 'Peanuts',
          reaction: 'Swelling, hives',
          severity: 'moderate',
          date_identified: '2022-08-20',
          status: 'active',
          type: 'Food Allergy',
          category: 'Food',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setAllergies(mockAllergies);
    } catch (error) {
      console.error('Error fetching allergies:', error);
      toast.error('Failed to load allergies');
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchAllergies();
  }, [patientId, fetchAllergies]);

  const addAllergy = async (newAllergy: Omit<Allergy, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const mockAllergy: Allergy = {
        ...newAllergy,
        id: Date.now().toString(),
        patient_id: newAllergy.patient_id || patientId,
        allergen: newAllergy.allergen || '',
        reaction: newAllergy.reaction || '',
        severity: newAllergy.severity || 'mild',
        date_identified: newAllergy.date_identified || new Date().toISOString().split('T')[0],
        status: newAllergy.status || 'active',
        type: newAllergy.type || 'Unknown',
        category: newAllergy.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setAllergies(prev => [...prev, mockAllergy]);
      toast.success('Allergy added successfully');
    } catch (error) {
      console.error('Error adding allergy:', error);
      toast.error('Failed to add allergy');
      throw error;
    }
  };

  const updateAllergy = async (id: string, updatedAllergy: Partial<Allergy>) => {
    try {
      const updatedData = {
        ...updatedAllergy,
        updated_at: new Date().toISOString()
      };
      
      setAllergies(prev => prev.map(allergy => 
        allergy.id === id ? { ...allergy, ...updatedData } : allergy
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
