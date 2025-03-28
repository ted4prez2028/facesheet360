
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Note {
  id: string;
  date: string;
  content: string;
  type: string;
  provider: string;
}

interface AddNoteParams {
  patientId: string;
  providerId: string;
  content: string;
  noteType: string;
}

export const usePatientNotes = (patientId: string) => {
  const queryClient = useQueryClient();
  
  // Fetch patient notes
  const { data: notes, isLoading, error } = useQuery({
    queryKey: ['patient-notes', patientId],
    queryFn: async (): Promise<Note[]> => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('chart_records')
        .select(`
          id,
          record_date,
          notes,
          record_type,
          provider_id,
          users:provider_id(name)
        `)
        .eq('patient_id', patientId)
        .eq('record_type', 'note')
        .order('record_date', { ascending: false });
        
      if (error) throw error;
      
      return data.map(record => ({
        id: record.id,
        date: record.record_date,
        content: record.notes || '',
        type: record.record_type,
        provider: record.users?.name || 'Unknown Provider'
      }));
    },
    enabled: !!patientId
  });
  
  // Add a new note
  const addNote = useMutation({
    mutationFn: async (params: AddNoteParams) => {
      const { patientId, providerId, content, noteType } = params;
      
      const { data, error } = await supabase
        .from('chart_records')
        .insert({
          patient_id: patientId,
          provider_id: providerId,
          record_type: 'note',
          notes: content,
          record_date: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-notes', patientId] });
      toast.success('Note added successfully');
    },
    onError: (error) => {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  });
  
  return {
    notes,
    isLoading,
    error,
    addNote
  };
};
