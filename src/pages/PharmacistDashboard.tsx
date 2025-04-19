import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Prescription } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useUpdatePrescriptionStatus } from "@/hooks/usePrescriptions";
import { useAuth } from "@/context/AuthContext";
import { PrescriptionCard } from "@/components/pharmacy/PrescriptionCard";
import { PharmacyStats } from "@/components/pharmacy/PharmacyStats";
import { Card, CardContent } from "@/components/ui/card";

const PharmacistDashboard = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { mutate: updatePrescriptionStatus } = useUpdatePrescriptionStatus();
  
  // Fetch all prescriptions
  const { data: prescriptions, isLoading, refetch } = useQuery({
    queryKey: ["pharmacy-prescriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          patients:patient_id (first_name, last_name),
          providers:provider_id (name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match Prescription type
      const transformedData = data.map((item: any) => ({
        ...item,
        patients: item.patients || { first_name: '', last_name: '' },
        providers: item.providers ? { name: item.providers.name || '' } : { name: '' }
      })) as Prescription[];
      
      return transformedData;
    },
    enabled: !!user?.id
  });

  const filteredPrescriptions = prescriptions?.filter(prescription => {
    const patientName = prescription.patients ? 
      `${prescription.patients.first_name} ${prescription.patients.last_name}`.toLowerCase() : "";
    const medicationName = prescription.medication_name.toLowerCase();
    const providerName = prescription.providers?.name?.toLowerCase() || "";
    
    return searchTerm === "" || 
      patientName.includes(searchTerm.toLowerCase()) ||
      medicationName.includes(searchTerm.toLowerCase()) ||
      providerName.includes(searchTerm.toLowerCase());
  });

  const pendingPrescriptions = filteredPrescriptions?.filter(p => p.status === "prescribed") || [];
  const filledPrescriptions = filteredPrescriptions?.filter(p => p.status !== "prescribed") || [];

  const handleFillPrescription = (prescriptionId: string) => {
    if (!user?.id) return;
    
    updatePrescriptionStatus({
      id: prescriptionId,
      status: "administered",
      administeredBy: user.id
    }, {
      onSuccess: () => {
        toast.success("Prescription filled");
        refetch();
      },
      onError: (error) => {
        toast.error(`Failed to fill prescription: ${(error as Error).message}`);
      }
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-gray-500">Loading prescriptions...</div>
        </div>
      </DashboardLayout>
    );
  }

  const uniquePatients = new Set(prescriptions?.map(p => p.patient_id)).size;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
            <p className="text-gray-600">Manage and fulfill prescriptions</p>
          </div>
          <div className="mt-4 md:mt-0 relative flex items-center w-full md:w-auto">
            <Search className="absolute left-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-80"
            />
          </div>
        </div>

        <PharmacyStats 
          pendingCount={pendingPrescriptions.length}
          filledCount={filledPrescriptions.filter(p => 
            new Date(p.administered_at || '').toDateString() === new Date().toDateString()
          ).length}
          totalPatients={uniquePatients}
        />

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              Pending ({pendingPrescriptions.length})
            </TabsTrigger>
            <TabsTrigger value="filled">
              Filled ({filledPrescriptions.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            {pendingPrescriptions.length === 0 ? (
              <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <p className="text-gray-500 mb-2">No pending prescriptions</p>
                  <p className="text-sm text-gray-400">All prescriptions have been filled</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingPrescriptions.map((prescription) => (
                  <PrescriptionCard
                    key={prescription.id}
                    prescription={prescription}
                    onFill={handleFillPrescription}
                    isPending
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="filled">
            {filledPrescriptions.length === 0 ? (
              <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <p className="text-gray-500 mb-2">No filled prescriptions</p>
                  <p className="text-sm text-gray-400">Prescriptions that have been filled will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filledPrescriptions.map((prescription) => (
                  <PrescriptionCard
                    key={prescription.id}
                    prescription={prescription}
                    onFill={handleFillPrescription}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PharmacistDashboard;
