
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePatientNotes } from '@/hooks/usePatientNotes';

interface PatientDataForCarePlan {
  [key: string]: unknown; // Adjust this interface based on the actual structure of patientData
}

interface CarePlanGeneratorProps {
  patientId: string;
}

export const useCarePlanGenerator = ({ patientId }: CarePlanGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { notes } = usePatientNotes(patientId);

  const generateCarePlan = useMutation({
    mutationFn: async (patientData: PatientDataForCarePlan) => {
      setIsGenerating(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-care-plan', {
          body: { patientId, patientData, notes }
        });
        
        if (error) throw new Error(error.message);
        
        return data?.carePlan || '';
      } catch (error) {
        console.error('Error generating care plan:', error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    onSuccess: (data) => {
      toast.success('Care plan generated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate care plan: ${error.message}`);
    }
  });

  return {
    generateCarePlan,
    isGenerating
  };
};
