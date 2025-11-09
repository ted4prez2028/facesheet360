import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePatientNotes = (patientId?: string) => {
  const query = useQuery({
    queryKey: ["patient-notes", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from("patient_notes")
        .select(`
          *,
          profiles!created_by(name, email)
        `)
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!patientId,
  });

  const queryClient = useQueryClient();

  const addNote = useMutation({
    mutationFn: async (noteData: {
      patientId: string;
      providerId: string;
      content: string;
      noteType: string;
    }) => {
      const { data, error } = await supabase
        .from("patient_notes")
        .insert([{
          patient_id: noteData.patientId,
          created_by: noteData.providerId,
          note_content: noteData.content,
          note_type: noteData.noteType,
        }])
        .select()
        .single();

      if (error) throw error;

      // Call the edge function to distribute charting profits
      try {
        await supabase.functions.invoke("distribute-charting-profit", {
          body: {
            patientId: noteData.patientId,
            providerId: noteData.providerId,
            chartType: noteData.noteType,
            noteId: data.id,
          },
        });
        
        toast.success("Note created and CareCoins distributed!");
      } catch (profitError) {
        console.error("Error distributing charting profits:", profitError);
        toast.warning("Note created, but profit distribution failed");
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patient-notes", variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ["care-coins-balance"] });
    },
    onError: (error) => {
      console.error("Error creating patient note:", error);
      toast.error("Failed to create patient note");
    },
  });

  // Transform the data to match expected format
  const notes = query.data?.map((note: any) => ({
    id: note.id,
    type: note.note_type,
    content: note.note_content,
    date: note.created_at,
    provider: note.profiles?.name || 'Unknown',
    carecoins_distributed: note.carecoins_distributed,
  })) || [];

  return {
    notes,
    isLoading: query.isLoading,
    addNote,
  };
};
