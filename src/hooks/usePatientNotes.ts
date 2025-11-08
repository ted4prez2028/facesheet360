import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePatientNotes = (patientId?: string) => {
  return useQuery({
    queryKey: ["patient-notes", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from("patient_notes")
        .select(`
          *,
          creator:created_by(name, email)
        `)
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!patientId,
  });
};

export const useCreatePatientNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteData: {
      patient_id: string;
      note_type: string;
      note_content: string;
      created_by: string;
    }) => {
      const { data, error } = await supabase
        .from("patient_notes")
        .insert([noteData])
        .select()
        .single();

      if (error) throw error;

      // Call the edge function to distribute charting profits
      try {
        await supabase.functions.invoke("distribute-charting-profit", {
          body: {
            patientId: noteData.patient_id,
            providerId: noteData.created_by,
            chartType: noteData.note_type,
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
      queryClient.invalidateQueries({ queryKey: ["patient-notes", variables.patient_id] });
      queryClient.invalidateQueries({ queryKey: ["care-coins-balance"] });
    },
    onError: (error) => {
      console.error("Error creating patient note:", error);
      toast.error("Failed to create patient note");
    },
  });
};
