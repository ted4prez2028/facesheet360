import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getPatientNotes, 
  createPatientNote, 
  updatePatientNote, 
  deletePatientNote,
  PatientNote
} from "@/lib/api/patientNotesApi";
import { toast } from "sonner";

export const usePatientNotes = (patientId: string) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['patient-notes', patientId],
    queryFn: () => getPatientNotes(patientId),
    enabled: !!patientId,
    retry: 3
  });

  const addNoteMutation = useMutation({
    mutationFn: async (noteData: { patientId: string; providerId: string; content: string; noteType: string }) => {
      // Map note types to database enum values
      const noteTypeMap: Record<string, 'progress' | 'assessment' | 'plan' | 'general' | 'discharge'> = {
        'Progress Note': 'progress',
        'Consultation': 'assessment',
        'Procedure Note': 'general',
        'Discharge Summary': 'discharge',
        'General': 'general'
      };
      
      const note: Omit<PatientNote, 'id'> = {
        patient_id: noteData.patientId,
        created_by: noteData.providerId,
        note_content: noteData.content,
        note_type: noteTypeMap[noteData.noteType] || 'general'
      };
      return createPatientNote(note);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patient-notes', variables.patientId] });
      toast.success("Note added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add note: ${error.message}`);
    }
  });

  // Transform the data to match expected format
  const notes = query.data?.map((note: any) => ({
    id: note.id,
    type: note.note_type,
    content: note.note_content,
    date: note.created_at,
    provider: note.created_by_user?.name || 'Unknown',
    providerId: note.created_by
  })) || [];

  return {
    ...query,
    notes,
    addNote: addNoteMutation
  };
};

export const useCreatePatientNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (note: Omit<PatientNote, 'id'>) => createPatientNote(note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patient-notes', variables.patient_id] });
      toast.success("Note added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add note: ${error.message}`);
    }
  });
};

export const useUpdatePatientNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PatientNote> }) =>
      updatePatientNote(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-notes'] });
      toast.success("Note updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update note: ${error.message}`);
    }
  });
};

export const useDeletePatientNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePatientNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-notes'] });
      toast.success("Note deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete note: ${error.message}`);
    }
  });
};
