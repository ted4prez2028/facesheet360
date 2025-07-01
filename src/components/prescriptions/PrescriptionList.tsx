
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/dateUtils";
import { Prescription } from "@/types";

interface PrescriptionListProps {
  patientId?: string;
}

const PrescriptionList: React.FC<PrescriptionListProps> = ({ patientId }) => {
  const { toast } = useToast();

  const { data: prescriptions = [], isLoading, error } = useQuery({
    queryKey: ["prescriptions", patientId],
    queryFn: async (): Promise<Prescription[]> => {
      try {
        const query = supabase
          .from("prescriptions")
          .select(`
            *,
            patients!inner(
              first_name,
              last_name,
              medical_record_number
            )
          `)
          .order("created_at", { ascending: false });

        if (patientId) {
          query.eq("patient_id", patientId);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        return data as Prescription[];
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
        toast({
          title: "Error",
          description: "Failed to load prescriptions",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "prescribed":
        return "bg-blue-100 text-blue-800";
      case "administered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading prescriptions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Failed to load prescriptions</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">No prescriptions found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((prescription) => (
        <Card key={prescription.id} className="w-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {prescription.medication_name}
              </CardTitle>
              <Badge className={getStatusColor(prescription.status)}>
                {prescription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Dosage</p>
                <p className="font-medium">{prescription.dosage}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Frequency</p>
                <p className="font-medium">{prescription.frequency}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <p className="font-medium">{formatDate(prescription.start_date)}</p>
                </div>
              </div>
              {prescription.end_date && (
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <p className="font-medium">{formatDate(prescription.end_date)}</p>
                  </div>
                </div>
              )}
            </div>
            {prescription.instructions && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Instructions</p>
                <p className="text-sm">{prescription.instructions}</p>
              </div>
            )}
            {prescription.administered_at && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Administered</p>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <p className="text-sm">{formatDate(prescription.administered_at)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PrescriptionList;
