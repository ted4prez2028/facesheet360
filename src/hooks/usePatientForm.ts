
import { useState } from "react";
import { toast } from "sonner";
import { Patient } from "@/types";
import { addPatient } from "@/lib/api/patientApi";
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
      console.log("Submitting patient data...");
      
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
      
      // Use the API function instead of direct Supabase access
      const result = await addPatient(patientData);
      console.log("Patient added successfully:", result);
      
      toast.success("Patient Added", {
        description: "Patient added successfully.",
      });
      
      resetForm();
      onSuccess();
      return true;
    } catch (error: any) {
      console.error("Error in submitForm:", error);
      
      if (error?.message?.includes('Authentication required') || 
          error?.message?.includes('auth')) {
        toast.error("Authentication Required", {
          description: "You must be logged in to add patients.",
        });
      } else if (error?.message?.includes('permission') || 
                error?.code === '42P17' || 
                error?.message?.includes('infinite recursion')) {
        toast.error("Database Permission Error", {
          description: "There's an issue with database permissions. Please try again or contact support.",
        });
      } else {
        toast.error("Error Adding Patient", {
          description: error?.message || "Failed to add patient.",
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
