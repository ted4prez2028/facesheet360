
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Note {
  id: string;
  patientId: string;
  date: string;
  provider: string;
  type: string;
  content: string;
}

export function usePatientNotes(patientId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  const { data: notes, isLoading, error } = useQuery({
    queryKey: ['patient-notes', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('chart_records')
        .select(`
          id,
          patient_id,
          provider_id,
          record_date,
          record_type,
          diagnosis,
          notes,
          users:provider_id (name)
        `)
        .eq('patient_id', patientId)
        .eq('record_type', 'note')
        .order('record_date', { ascending: false });
        
      if (error) throw error;
      
      return data.map(note => ({
        id: note.id,
        patientId: note.patient_id,
        date: note.record_date,
        provider: note.users?.name || 'Unknown Provider',
        type: note.diagnosis || 'Progress Note',
        content: note.notes || ''
      }));
    },
    enabled: !!patientId
  });

  const addNote = useMutation({
    mutationFn: async ({ 
      patientId, 
      providerId, 
      content, 
      noteType 
    }: { 
      patientId: string; 
      providerId: string; 
      content: string; 
      noteType: string;
    }) => {
      const { data, error } = await supabase
        .from('chart_records')
        .insert({
          patient_id: patientId,
          provider_id: providerId,
          record_type: 'note',
          record_date: new Date().toISOString(),
          diagnosis: noteType,
          notes: content
        })
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-notes', patientId] });
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully",
      });
    },
    onError: (error) => {
      console.error("Error saving note:", error);
      toast({
        title: "Error saving note",
        description: "An error occurred while saving your note",
        variant: "destructive",
      });
    }
  });

  const getPatientNotesForCarePlan = async () => {
    if (!patientId) return [];
    
    try {
      const { data, error } = await supabase
        .from('chart_records')
        .select(`
          id,
          record_date,
          diagnosis,
          notes
        `)
        .eq('patient_id', patientId)
        .eq('record_type', 'note')
        .order('record_date', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error("Error fetching patient notes for care plan:", error);
      return [];
    }
  };

  return {
    notes,
    isLoading,
    error,
    addNote,
    selectedNote,
    setSelectedNote,
    getPatientNotesForCarePlan
  };
}
