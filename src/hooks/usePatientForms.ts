import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VitalsFormData {
  temperature: string;
  blood_pressure_systolic: string;
  blood_pressure_diastolic: string;
  heart_rate: string;
  respiratory_rate: string;
  oxygen_saturation: string;
  weight: string;
  height: string;
  pain_scale: string;
}

interface MedicationFormData {
  medication_name: string;
  dosage: string;
  frequency: string;
  route: string;
  instructions: string;
}

export const usePatientForms = (selectedPatient: string | null, userId: string | undefined) => {
  const queryClient = useQueryClient();
  
  const [isAddingVitals, setIsAddingVitals] = useState(false);
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');

  const [newVitals, setNewVitals] = useState<VitalsFormData>({
    temperature: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    weight: '',
    height: '',
    pain_scale: ''
  });

  const [newMedication, setNewMedication] = useState<MedicationFormData>({
    medication_name: '',
    dosage: '',
    frequency: '',
    route: 'oral',
    instructions: ''
  });

  const handleAddVitals = async () => {
    if (!selectedPatient || !userId) return;

    try {
      const vitalsToAdd = Object.entries(newVitals)
        .filter(([_, value]) => value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: parseFloat(value) }), {});

      const { error } = await supabase
        .from('patient_vitals')
        .insert({
          patient_id: selectedPatient,
          recorded_by: userId,
          recorded_at: new Date().toISOString(),
          ...vitalsToAdd
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['patient-vitals'] });
      queryClient.invalidateQueries({ queryKey: ['vitals', selectedPatient] });

      toast.success('Vitals added - CareCoins will be distributed automatically!');
      setNewVitals({
        temperature: '',
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        heart_rate: '',
        respiratory_rate: '',
        oxygen_saturation: '',
        weight: '',
        height: '',
        pain_scale: ''
      });
      setIsAddingVitals(false);
    } catch (error) {
      console.error('Error adding vitals:', error);
      toast.error('Failed to add vitals');
    }
  };

  const handleAddMedication = async () => {
    if (!selectedPatient || !userId) return;

    try {
      const { error } = await supabase
        .from('medication_orders')
        .insert({
          patient_id: selectedPatient,
          prescribed_by: userId,
          start_date: new Date().toISOString(),
          status: 'active',
          ...newMedication
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['medication-orders', selectedPatient] });

      toast.success('Medication added - CareCoins will be distributed automatically!');
      setNewMedication({
        medication_name: '',
        dosage: '',
        frequency: '',
        route: 'oral',
        instructions: ''
      });
      setIsAddingMedication(false);
    } catch (error) {
      console.error('Error adding medication:', error);
      toast.error('Failed to add medication');
    }
  };

  const handleUpdateRoom = async () => {
    if (!selectedPatient) return;

    try {
      const { error } = await supabase
        .from('patients')
        .update({ room_number: roomNumber })
        .eq('id', selectedPatient);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', selectedPatient] });
      queryClient.invalidateQueries({ queryKey: ['charting-patients'] });

      toast.success('Room number updated successfully');
      setIsEditingRoom(false);
    } catch (error) {
      console.error('Error updating room number:', error);
      toast.error('Failed to update room number');
    }
  };

  return {
    // Vitals
    isAddingVitals,
    setIsAddingVitals,
    newVitals,
    setNewVitals,
    handleAddVitals,
    
    // Medications
    isAddingMedication,
    setIsAddingMedication,
    newMedication,
    setNewMedication,
    handleAddMedication,
    
    // Room
    isEditingRoom,
    setIsEditingRoom,
    roomNumber,
    setRoomNumber,
    handleUpdateRoom,
  };
};
