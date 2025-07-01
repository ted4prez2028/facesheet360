
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Immunization {
  id: string;
  patient_id: string;
  vaccine: string;
  cvx_code?: string;
  cvxCode?: string;
  status: string;
  source?: string;
  date_administered?: string;
  dateAdministered?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any; // Index signature for DataItem compatibility
}

export function useImmunizations(patientId: string) {
  const queryClient = useQueryClient();

  const { data: immunizations, isLoading } = useQuery({
    queryKey: ['immunizations', patientId],
    queryFn: async () => {
      // Mock data since immunizations table doesn't exist
      const mockImmunizations: Immunization[] = [
        {
          id: '1',
          patient_id: patientId,
          vaccine: 'COVID-19 Vaccine',
          cvx_code: '208',
          cvxCode: '208',
          status: 'administered',
          source: 'Provider',
          date_administered: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          dateAdministered: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2', 
          patient_id: patientId,
          vaccine: 'Influenza Vaccine',
          cvx_code: '141',
          cvxCode: '141',
          status: 'administered',
          source: 'Provider',
          date_administered: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          dateAdministered: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      return mockImmunizations;
    }
  });

  const addImmunization = useMutation({
    mutationFn: async (immunization: Omit<Immunization, 'id' | 'created_at' | 'updated_at'>) => {
      // Mock implementation
      const mockImmunization: Immunization = {
        ...immunization,
        id: Date.now().toString(),
        patient_id: immunization.patient_id,
        vaccine: immunization.vaccine,
        status: immunization.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return mockImmunization;
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
      // Mock implementation - ensure all required fields are present
      const mockUpdatedImmunization: Immunization = {
        id,
        patient_id: patientId,
        vaccine: immunization.vaccine || 'Updated Vaccine',
        status: immunization.status || 'administered',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...immunization
      };
      
      return mockUpdatedImmunization;
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
      // Mock implementation
      console.log('Mock deleting immunization:', id);
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
