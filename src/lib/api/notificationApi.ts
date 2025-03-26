
import { supabase } from "@/integrations/supabase/client";

export const getNotifications = async () => {
  try {
    console.log("Fetching notifications (mock)");
    return [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};
