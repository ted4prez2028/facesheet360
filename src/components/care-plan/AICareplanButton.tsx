
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useGenerateAICarePlan } from "@/hooks/useCarePlans";
import { Patient } from "@/types";

interface AICareplanButtonProps {
  patient: Patient;
  className?: string;
}

export const AICareplanButton = ({ patient, className }: AICareplanButtonProps) => {
  const { mutate: generateCarePlan, isPending } = useGenerateAICarePlan();

  const handleGenerateCarePlan = () => {
    generateCarePlan(patient);
  };

  return (
    <Button
      onClick={handleGenerateCarePlan}
      variant="default"
      className={`bg-gradient-to-r from-health-600 to-health-700 hover:from-health-700 hover:to-health-800 ${className}`}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4 mr-2" />
      )}
      Generate AI Care Plan
    </Button>
  );
};

export default AICareplanButton;
