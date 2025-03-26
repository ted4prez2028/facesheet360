
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

interface UseCarePlanGeneratorProps {
  patientId: string;
}

export function useCarePlanGenerator({ patientId }: UseCarePlanGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateCarePlan = async (patientData: any) => {
    if (!patientId || !patientData) {
      toast({
        title: "Missing patient data",
        description: "Complete patient information is required to generate a care plan.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke('generate-care-plan', {
        body: { patientData }
      });

      if (error) throw error;
      
      if (data && data.carePlan) {
        setGeneratedPlan(data.carePlan);
        
        // Save the care plan to the database
        if (user?.id) {
          const { error: saveError } = await supabase
            .from('care_plans')
            .insert({
              patient_id: patientId,
              provider_id: user.id,
              content: data.carePlan,
              is_ai_generated: true,
              status: 'draft'
            });
            
          if (saveError) {
            console.error('Error saving care plan:', saveError);
            toast({
              title: "Care plan generated but not saved",
              description: "The care plan couldn't be saved to the database.",
              variant: "warning",
            });
          } else {
            toast({
              title: "Care plan generated and saved",
              description: "AI has created a personalized care plan based on patient data."
            });
          }
        }
        
        return data.carePlan;
      } else {
        throw new Error("Failed to generate care plan - no data returned");
      }
    } catch (error) {
      console.error('Error generating care plan:', error);
      toast({
        title: "Failed to generate care plan",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateCarePlan,
    isGenerating,
    generatedPlan,
  };
}
