
import { useState } from "react";
import { toast } from "sonner";
import { Patient } from "@/types";
import { addPatient } from "@/lib/api/patientApi";

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

  const submitForm = async () => {
    if (!validateForm()) return false;

    setFormState((prev) => ({ ...prev, isLoading: true }));
    
    try {
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
      await addPatient(patientData);
      
      toast.success("Patient Added", {
        description: "Patient added successfully.",
      });
      
      resetForm();
      onSuccess();
      return true;
    } catch (error: any) {
      console.error("Error in submitForm:", error);
      
      // Handle specific error types
      if (error?.message?.includes('infinite recursion') || error?.code === '42P17') {
        toast.error("Database Permission Error", {
          description: "Please ensure you're logged in with the correct credentials before adding a patient.",
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
