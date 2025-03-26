
import { useState, useEffect, useCallback } from "react";
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
  const { isAuthenticated, user, session } = useAuth();

  // Verify session and attempt to refresh it if needed
  useEffect(() => {
    const checkAndRefreshSession = async () => {
      // First check if we're authenticated based on our context
      if (!isAuthenticated) {
        console.log("Not authenticated according to context, checking session...");
        
        // Double-check with Supabase directly
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          console.log("No valid session found, redirecting to login");
          toast.error("Please login to access patient data");
          navigate("/login", { replace: true });
        } else {
          console.log("Session exists but context doesn't reflect it, refreshing...");
          // We have a session but our context doesn't show it, refresh the page
          window.location.reload();
        }
      } else {
        console.log("Authentication verified, user:", user?.id);
      }
    };
    
    checkAndRefreshSession();
  }, [isAuthenticated, navigate, user]);

  // When we detect an error, log it and try to refetch the data
  useEffect(() => {
    if (error) {
      console.error("Patient data fetch error:", error);
      
      // If we get a database error but we're authenticated, the session might be invalid
      if (isAuthenticated && error.message?.includes("Database permission error")) {
        // Check session validity
        supabase.auth.getSession().then(({ data }) => {
          if (!data.session) {
            toast.error("Your session has expired. Please login again.");
            navigate("/login", { replace: true });
          }
        });
      }
      
      // Attempt to refetch after a delay
      const timer = setTimeout(() => {
        refetch();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, refetch, isAuthenticated, navigate]);

  const handleIdentifyPatient = useCallback((patientId: string) => {
    if (patientId) {
      navigate(`/patients/${patientId}`);
    }
  }, [navigate]);

  const handleDeletePatient = useCallback(async (id: string) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      deletePatientMutation.mutate(id);
    }
  }, [deletePatientMutation]);

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
