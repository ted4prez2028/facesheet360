
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePatients, useDeletePatient } from "@/hooks/usePatients";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Patient } from "@/types";
import { checkSession } from "@/lib/authUtils";

export const usePatientsPage = () => {
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFaceIdDialogOpen, setIsFaceIdDialogOpen] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  
  const navigate = useNavigate();
  const { data: patients = [], isLoading, error, refetch } = usePatients();
  const deletePatientMutation = useDeletePatient();
  const { isAuthenticated, user } = useAuth();

  // Verify session and attempt to refresh it if needed
  useEffect(() => {
    const verifyAuthStatus = async () => {
      try {
        // Check if we're authenticated first
        if (!isAuthenticated) {
          console.log("Not authenticated according to context, checking session directly...");
          
          // Verify with Supabase directly
          const hasSession = await checkSession();
          
          if (!hasSession) {
            console.log("No valid session found");
            toast.error("Please login to access patient data");
          } else {
            console.log("Session exists but context doesn't reflect it, refreshing...");
            // Session exists but our auth context doesn't show it
            window.location.reload();
          }
        } else {
          console.log("Authentication verified, user:", user?.id);
        }
      } catch (err) {
        console.error("Auth verification error:", err);
      } finally {
        setSessionChecked(true);
      }
    };
    
    verifyAuthStatus();
  }, [isAuthenticated, user]);

  // When we detect an error, log it and try to refetch the data
  useEffect(() => {
    if (error) {
      console.error("Patient data fetch error:", error);
      
      // If we get a database error but we're authenticated, the session might be invalid
      if (isAuthenticated && error.message?.includes("Database permission error")) {
        // Check session validity
        checkSession().then((hasSession) => {
          if (!hasSession) {
            toast.error("Your session has expired. Please login again.");
            navigate("/login", { replace: true });
          }
        });
      }
    }
  }, [error, navigate, isAuthenticated]);

  const handleIdentifyPatient = useCallback((patientId: string) => {
    if (patientId) {
      navigate(`/patients/${patientId}`);
    }
  }, [navigate]);

  const handleDeletePatient = useCallback(async (id: string) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        await deletePatientMutation.mutate(id);
      } catch (err) {
        console.error("Delete patient error:", err);
        toast.error("Failed to delete patient. Please try again.");
      }
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
    isAuthenticated,
    sessionChecked
  };
};
