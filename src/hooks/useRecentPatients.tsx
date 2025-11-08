
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PatientInfo {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
}

export interface RecentPatient {
  id: string;
  name: string;
  age: number;
  condition: string;
  lastVisit: string;
  status: string;
}

/**
 * Fetches recent patients with their visit information
 */
export const useRecentPatients = (limit: number = 5) => {
  return useQuery({
    queryKey: ['recent-patients', limit],
    queryFn: async (): Promise<RecentPatient[]> => {
      try {
        // Fetch recent patient notes as a proxy for recent patients
        const { data: chartRecords, error: chartError } = await supabase
          .from('patient_notes')
          .select(`
            id,
            created_at,
            note_content,
            patient_id,
            patients:patient_id (
              id,
              name,
              date_of_birth
            )
          `)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (chartError) throw chartError;
        
        if (!chartRecords || chartRecords.length === 0) {
          console.log("No recent patient records found");
          return [];
        }

        // Format the data
        return chartRecords
          .filter(record => record.patients) // Filter out any records with missing patient data
          .map(record => {
            const patient = record.patients as any;
            
            // Calculate age
            const birthDate = new Date(patient.date_of_birth);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }

            const recordDate = new Date(record.created_at);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - recordDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Format last visit string
            let lastVisit: string;
            if (diffDays === 0) {
              lastVisit = "Today";
            } else if (diffDays === 1) {
              lastVisit = "Yesterday";
            } else if (diffDays <= 7) {
              lastVisit = `${diffDays} days ago`;
            } else {
              lastVisit = recordDate.toLocaleDateString();
            }

            // Determine status from note content
            let status = "Stable";
            const noteContentLower = (record.note_content || "").toLowerCase();
            if (noteContentLower.includes("critical") || noteContentLower.includes("severe")) {
              status = "Critical";
            } else if (noteContentLower.includes("follow")) {
              status = "Follow-up";
            }

            return {
              id: patient.id,
              name: patient.name,
              age,
              condition: record.note_content ? record.note_content.substring(0, 50) + "..." : "General note",
              lastVisit,
              status
            };
          });
      } catch (error) {
        console.error("Error fetching recent patients:", error);
        toast.error("Failed to load recent patients");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
