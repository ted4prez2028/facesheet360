
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePatients, useDeletePatient } from "@/hooks/usePatients";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Patient } from "@/types";

export const usePatientsPage = () => {
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFaceIdDialogOpen, setIsFaceIdDialogOpen] = useState(false);
  
  const navigate = useNavigate();
  const { data: patients = [], isLoading, error, refetch } = usePatients();
  const deletePatientMutation = useDeletePatient();
  const { isAuthenticated } = useAuth();

  // Verify session and attempt to refresh it if needed
  useEffect(() => {
    const checkAndRefreshSession = async () => {
      if (!isAuthenticated) {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          toast.error("Please login to access patient data");
          navigate("/login");
        }
      }
    };
    
    checkAndRefreshSession();
  }, [isAuthenticated, navigate]);

  // When we detect an error, try to refetch the data
  useEffect(() => {
    if (error) {
      console.error("Patient data fetch error:", error);
      // Attempt to refetch after a delay
      const timer = setTimeout(() => {
        refetch();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [error, refetch]);

  const handleIdentifyPatient = (patientId: string) => {
    if (patientId) {
      navigate(`/patients/${patientId}`);
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      deletePatientMutation.mutate(id);
    }
  };

  const filteredPatients = patients.filter((patient: Patient) => {
    const searchStr = searchQuery.toLowerCase();
    return (
      patient.first_name?.toLowerCase().includes(searchStr) ||
      patient.last_name?.toLowerCase().includes(searchStr) ||
      (patient.email && patient.email.toLowerCase().includes(searchStr)) ||
      (patient.phone && patient.phone.toLowerCase().includes(searchStr)) ||
      (patient.medical_record_number &&
        patient.medical_record_number.toLowerCase().includes(searchStr))
    );
  });

  return {
    isAddPatientOpen,
    setIsAddPatientOpen,
    searchQuery,
    setSearchQuery,
    isFaceIdDialogOpen,
    setIsFaceIdDialogOpen,
    patients,
    isLoading,
    error,
    refetch,
    handleIdentifyPatient,
    handleDeletePatient,
    filteredPatients,
    isAuthenticated
  };
};
