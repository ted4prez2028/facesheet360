
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
      
      // Mock data since chart_records table doesn't exist
      const mockNotes: Note[] = [
        {
          id: '1',
          date: new Date().toISOString(),
          content: 'Patient reported feeling well today. Vital signs are stable.',
          type: 'Progress Note',
          provider: 'Dr. Smith'
        },
        {
          id: '2',
          date: new Date(Date.now() - 86400000).toISOString(),
          content: 'Patient completed physical therapy session. Good improvement in mobility.',
          type: 'Therapy Note',
          provider: 'Jane Therapist'
        },
        {
          id: '3',
          date: new Date(Date.now() - 2 * 86400000).toISOString(),
          content: 'Medication review completed. No adverse reactions reported.',
          type: 'Medication Review',
          provider: 'Dr. Johnson'
        }
      ];
      
      return mockNotes;
    },
    enabled: !!patientId
  });
  
  // Add a new note
  const addNote = useMutation({
    mutationFn: async (params: AddNoteParams) => {
      const { patientId, providerId, content, noteType } = params;
      
      // Mock implementation
      const mockNote: Note = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        content: content,
        type: noteType,
        provider: 'Current Provider'
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockNote;
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
