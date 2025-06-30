
import { useState } from "react";
import { toast } from "sonner";
import { Patient } from "@/types";
import { addPatient } from "@/lib/api/patientApi";
import { addPatientDirect } from "@/lib/api/directPatientsApi";
import { supabase } from "@/integrations/supabase/client";

export interface PatientFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  medicalRecordNumber: string;
  insuranceProvider: string;
  policyNumber: string;
  address: string;
  facialData: string | null;
  isLoading: boolean;
}

export const usePatientForm = (onSuccess: () => void) => {
  const initialState: PatientFormState = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "Unknown",
    medicalRecordNumber: "",
    insuranceProvider: "",
    policyNumber: "",
    address: "",
    facialData: null,
    isLoading: false,
  };

  const [formState, setFormState] = useState<PatientFormState>(initialState);

  const updateField = (field: keyof Omit<PatientFormState, "isLoading">, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleFacialDataCapture = (data: string) => {
    setFormState((prev) => ({ ...prev, facialData: data }));
    toast("Facial data captured", {
      description: "Facial recognition data has been captured successfully.",
    });
  };

  const resetForm = () => {
    setFormState(initialState);
  };

  const validateForm = (): boolean => {
    if (!formState.firstName || !formState.lastName || !formState.dateOfBirth) {
      toast.error("Missing required fields", {
        description: "Please fill in all required fields.",
      });
      return false;
    }
    return true;
  };

  const verifySession = async (): Promise<boolean> => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("Authentication Required", {
          description: "You must be logged in to add patients.",
        });
        return false;
      }
      
      // Also refresh the token if it's getting close to expiry
      if (data.session.expires_at) {
        const expiresAt = new Date(data.session.expires_at * 1000);
        const now = new Date();
        
        // If token expires in less than 5 minutes, refresh it
        if ((expiresAt.getTime() - now.getTime()) < 5 * 60 * 1000) {
          console.log("Token expiring soon, refreshing...");
          await supabase.auth.refreshSession();
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error verifying session:", error);
      toast.error("Authentication Error", {
        description: "There was a problem verifying your authentication status.",
      });
      return false;
    }
  };

  const submitForm = async () => {
    if (!validateForm()) return false;
    
    // Verify authentication first
    const hasSession = await verifySession();
    if (!hasSession) return false;

    setFormState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      console.log("Submitting patient data:", patientData);
      
      // Convert form state to patient object for API
      const patientData: Partial<Patient> = {
        first_name: formState.firstName,
        last_name: formState.lastName,
        email: formState.email || null,
        phone: formState.phone || null,
        date_of_birth: formState.dateOfBirth,
        gender: formState.gender,
        medical_record_number: formState.medicalRecordNumber || null,
        insurance_provider: formState.insuranceProvider || null,
        policy_number: formState.policyNumber || null,
        address: formState.address || null,
        facial_data: formState.facialData || null,
      };
      
      // Try with direct method first
      let result;
      try {
        console.log("Using direct patient API method");
        result = await addPatientDirect(patientData);
      } catch (error: unknown) {
        console.error("Direct API method failed:", error);
        // Fall back to the regular method
        console.log("Falling back to regular API method");
        result = await addPatient(patientData);
      }
      
      console.log("Patient added successfully:", result);
      
      toast.success("Patient Added", {
        description: "Patient added successfully.",
      });
      
      resetForm();
      onSuccess();
      return true;
    } catch (error: unknown) {
      console.error("Error in submitForm:", error);
      
      if (error instanceof Error && (error?.message?.includes('Authentication required') || 
          error?.message?.includes('auth'))) {
        toast.error("Authentication Required", {
          description: "You must be logged in to add patients.",
        });
      } else if (error instanceof Error && (error?.message?.includes('infinite recursion') || 
                (error as { code?: string })?.code === '42P17')) {
        toast.error("Database Permission Error", {
          description: "There's an issue with database permissions. Please try logging out and logging back in.",
        });
      } else if (error instanceof Error && (error?.message?.includes('permission') || 
                (error as { code?: string })?.code === '42501')) {
        toast.error("Database Permission Error", {
          description: "You don't have permission to add patients. Please contact your administrator.",
        });
      } else {
        toast.error("Error Adding Patient", {
          description: error instanceof Error ? error?.message : "Failed to add patient.",
        });
      }
      return false;
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return {
    formState,
    updateField,
    handleFacialDataCapture,
    resetForm,
    submitForm,
  };
};
