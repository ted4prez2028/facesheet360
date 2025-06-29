
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
        // Fetch recent chart records
        const { data: chartRecords, error: chartError } = await supabase
          .from('chart_records')
          .select(`
            id,
            record_date,
            diagnosis,
            patient_id,
            patients:patient_id (
              id,
              first_name,
              last_name,
              date_of_birth
            )
          `)
          .order('record_date', { ascending: false })
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
            const patient = record.patients as PatientInfo;
            
            // Calculate age
            const birthDate = new Date(patient.date_of_birth);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }

            const recordDate = new Date(record.record_date);
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

            // Determine status based on diagnosis or randomly if not available
            let status = "Stable";
            if (record.diagnosis) {
              const diagnosisLower = record.diagnosis.toLowerCase();
              if (diagnosisLower.includes("critical") || diagnosisLower.includes("severe")) {
                status = "Critical";
              } else if (diagnosisLower.includes("follow")) {
                status = "Follow-up";
              }
            }

            return {
              id: patient.id,
              name: `${patient.first_name} ${patient.last_name}`,
              age,
              condition: record.diagnosis || "General checkup",
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
