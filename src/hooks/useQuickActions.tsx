
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';

export function useQuickActions() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const addPatient = () => {
    navigate("/patients?action=add");
    toast.info("Add patient form opened");
  };

  const viewSchedule = () => {
    navigate("/appointments");
    toast.info("Viewing your schedule");
  };
  
  const createNote = async () => {
    if (!user) return;
    
    try {
      // Navigate to charting page which will have note creation functionality
      navigate("/charting");
      toast.info("Create a new patient note");
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    }
  };
  
  const viewAnalytics = () => {
    navigate("/analytics");
    toast.info("Viewing analytics dashboard");
  };

  return {
    addPatient,
    viewSchedule,
    createNote,
    viewAnalytics
  };
}
