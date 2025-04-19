import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface Prescription {
  id: string;
  patient_id: string;
  provider_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  start_date: string;
  end_date?: string;
  instructions?: string;
  status: string;
  created_at: string;
  updated_at: string;
  administered_at?: string;
  administered_by?: string;
  patients?: {
    first_name: string;
    last_name: string;
  };
  providers?: {
    name: string;
  };
}

export const usePrescriptions = (patientId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['prescriptions', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          providers:provider_id (name)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching prescriptions:', error);
        throw error;
      }

      return data as Prescription[];
    },
    enabled: !!patientId,
  });
};

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prescription: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('prescriptions')
        .insert(prescription)
        .select()
        .single();

      if (error) throw error;
      return data as Prescription;
    },
    onSuccess: (_, variables) => {
      toast.success('Prescription created successfully');
      queryClient.invalidateQueries({ queryKey: ['prescriptions', variables.patient_id] });
    },
    onError: (error) => {
      toast.error(`Failed to create prescription: ${(error as Error).message}`);
    },
  });
};

export const useUpdatePrescriptionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, administeredBy }: { id: string; status: string; administeredBy?: string }) => {
      const updates: any = { status };
      
      if (status === 'administered' && administeredBy) {
        updates.administered_at = new Date().toISOString();
        updates.administered_by = administeredBy;
      }

      const { data, error } = await supabase
        .from('prescriptions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Prescription;
    },
    onSuccess: (data) => {
      toast.success(`Prescription ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
    onError: (error) => {
      toast.error(`Failed to update prescription: ${(error as Error).message}`);
    },
  });
};

export const useAdministerPrescription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (prescriptionId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('prescriptions')
        .update({
          status: 'administered',
          administered_at: new Date().toISOString(),
          administered_by: user.id
        })
        .eq('id', prescriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Medication administered successfully');
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
    onError: (error) => {
      toast.error(`Failed to administer medication: ${(error as Error).message}`);
    },
  });
};
