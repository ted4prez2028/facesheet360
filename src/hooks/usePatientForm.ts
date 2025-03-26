
import { useState } from "react";
import { toast } from "sonner";
import { addPatient } from "@/lib/supabaseApi";
import { Patient } from "@/types";

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
    if (!validateForm()) return;

    setFormState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      await addPatient({
        first_name: formState.firstName,
        last_name: formState.lastName,
        email: formState.email,
        phone: formState.phone,
        date_of_birth: formState.dateOfBirth,
        gender: formState.gender,
        medical_record_number: formState.medicalRecordNumber,
        insurance_provider: formState.insuranceProvider,
        policy_number: formState.policyNumber,
        address: formState.address,
        facial_data: formState.facialData,
      });
      
      toast.success("Patient Added", {
        description: "Patient added successfully.",
      });
      
      resetForm();
      onSuccess();
      return true;
    } catch (error: any) {
      // Handle the database permission error specifically
      if (error?.code === '42P17' || error?.message?.includes('infinite recursion')) {
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
