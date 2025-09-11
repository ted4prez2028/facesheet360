import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Heart, Pill, FileText, Brain, AlertTriangle } from "lucide-react";
import PatientDetailHeader from "./PatientDetailHeader";
import VitalSigns from "./VitalSigns";
import MedicationsSection from "./MedicationsSection";
import LabResults from "./LabResults";
import ImagingRecords from "./ImagingRecords";
import NotesSection from "./NotesSection";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  useVitalSigns, 
  useLabResults, 
  useMedications, 
  useImagingRecords 
} from "@/hooks/useChartData";
import { Patient } from "@/types";

interface LocalPatient {
  id: string;
  name: string;
  age: number;
  status: string;
  lastVisit: string;
  imgUrl: string | null;
  date_of_birth?: string;
  gender?: string;
  medical_record_number?: string;
}

interface PatientVital {
  id: string;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  pain_scale?: number;
  recorded_at: string;
  recorded_by: string;
}

interface MedicationOrder {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  route?: string;
  start_date: string;
  end_date?: string;
  status: string;
  instructions?: string;
}

interface UnifiedPatientInterfaceProps {
  selectedPatient: string | null;
  patientData: LocalPatient | undefined;
  userId: string | undefined;
  onBack: () => void;
  initialTab?: string;
}

const UnifiedPatientInterface = ({ 
  selectedPatient, 
  patientData, 
  userId, 
  onBack,
  initialTab 
}: UnifiedPatientInterfaceProps) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [isAddingVitals, setIsAddingVitals] = useState(false);
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const { user } = useAuth();

  // Handle initial tab and auto-show forms
  useEffect(() => {
    if (initialTab === 'vitals') {
      setIsAddingVitals(true);
    } else if (initialTab === 'medications') {
      setIsAddingMedication(true);
    }
  }, [initialTab]);

  // Fetch patient chart data from the database
  const { data: vitalSigns = [] } = useVitalSigns(selectedPatient);
  const { data: labResults = [] } = useLabResults(selectedPatient);
  const { data: medications = [] } = useMedications(selectedPatient);
  const { data: imaging = [] } = useImagingRecords(selectedPatient);

  const [newVitals, setNewVitals] = useState({
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

  const [newMedication, setNewMedication] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    route: 'oral',
    instructions: ''
  });

  // Create combined chart data object with proper types
  const chartData = {
    vitalSigns: vitalSigns.map(vs => ({
      ...vs,
      created_at: (vs as any).created_at || new Date().toISOString(),
      updated_at: (vs as any).updated_at || new Date().toISOString()
    })),
    medications: medications,
    labResults: labResults.map(lr => ({
      ...lr,
      result: (lr as any).result || '',
      date_collected: (lr as any).date_collected || (lr as any).created_at || new Date().toISOString()
    })),
    imaging: imaging.map(img => ({
      ...img,
      study_type: (img as any).study_type || '',
      body_part: (img as any).body_part || '',
      study_date: (img as any).study_date || (img as any).created_at || new Date().toISOString()
    })),
    notes: [],
    history: [],
    diagnosis: "",
    allergies: []
  };

  // Convert local patient data to full Patient type
  const enhancedPatientData: Patient | undefined = patientData ? {
    id: patientData.id,
    first_name: patientData.name?.split(' ')[0] || '',
    last_name: patientData.name?.split(' ').slice(1).join(' ') || '',
    date_of_birth: patientData.date_of_birth || '1990-01-01',
    gender: patientData.gender || 'Not specified',
    phone: '',
    email: '',
    address: '',
    insurance_provider: '',
    insurance_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    medical_history: '',
    allergies: '',
    medications: '',
    notes: '',
    medical_record_number: patientData.medical_record_number || `MR-${patientData.id.slice(0, 8)}`,
    age: patientData.age,
    status: patientData.status,
    lastVisit: patientData.lastVisit,
    imgUrl: patientData.imgUrl,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } : undefined;

  const handleAddVitals = async () => {
    if (!selectedPatient || !user) return;

    try {
      const vitalsToAdd = Object.entries(newVitals)
        .filter(([_, value]) => value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: parseFloat(value) }), {});

      const { error } = await supabase
        .from('patient_vitals')
        .insert({
          patient_id: selectedPatient,
          recorded_by: user.id,
          recorded_at: new Date().toISOString(),
          ...vitalsToAdd
        });

      if (error) throw error;

      toast.success('Vitals added successfully');
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
    if (!selectedPatient || !user) return;

    try {
      const { error } = await supabase
        .from('medication_orders')
        .insert({
          patient_id: selectedPatient,
          prescribed_by: user.id,
          start_date: new Date().toISOString(),
          status: 'active',
          ...newMedication
        });

      if (error) throw error;

      toast.success('Medication added successfully');
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

  if (!selectedPatient) {
    return null;
  }

  const displayName = enhancedPatientData 
    ? `${enhancedPatientData.first_name} ${enhancedPatientData.last_name}`.trim()
    : '';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Back button */}
      <div className="mb-4 shrink-0">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-primary hover:text-primary/80 text-sm font-medium p-0 h-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </Button>
      </div>

      {/* Unified Patient Interface */}
      <Card className="shadow-sm flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-0 shrink-0">
          <PatientDetailHeader
            patientName={displayName}
            patientId={enhancedPatientData?.id}
            patientAge={enhancedPatientData?.age}
          />
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col overflow-hidden p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-6 shrink-0">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="labs">Labs</TabsTrigger>
              <TabsTrigger value="imaging">Imaging</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-4 overflow-hidden">
              {/* Overview Tab */}
              <TabsContent value="overview" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <div className="space-y-6">
                  {/* Patient Info Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Heart className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="text-sm font-medium">Latest Vitals</p>
                            <p className="text-xs text-muted-foreground">
                              {vitalSigns.length > 0 ? 
                                new Date().toLocaleDateString() : 
                                'No vitals recorded'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Pill className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">Active Medications</p>
                            <p className="text-xs text-muted-foreground">
                              {medications.filter(m => m.status === 'active').length} active
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">Recent Labs</p>
                            <p className="text-xs text-muted-foreground">
                              {labResults.length} results
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                </div>
              </TabsContent>

              {/* Enhanced Vitals Tab */}
              <TabsContent value="vitals" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Vital Signs</h3>
                    <Button onClick={() => setIsAddingVitals(true)} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Vitals
                    </Button>
                  </div>
                  
                  {isAddingVitals && (
                    <Card>
                      <CardHeader>
                        <h4 className="font-medium">Add New Vitals</h4>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium">Temperature (°F)</label>
                            <Input
                              type="number"
                              value={newVitals.temperature}
                              onChange={(e) => setNewVitals({...newVitals, temperature: e.target.value})}
                              placeholder="98.6"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Systolic BP</label>
                            <Input
                              type="number"
                              value={newVitals.blood_pressure_systolic}
                              onChange={(e) => setNewVitals({...newVitals, blood_pressure_systolic: e.target.value})}
                              placeholder="120"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Diastolic BP</label>
                            <Input
                              type="number"
                              value={newVitals.blood_pressure_diastolic}
                              onChange={(e) => setNewVitals({...newVitals, blood_pressure_diastolic: e.target.value})}
                              placeholder="80"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Heart Rate</label>
                            <Input
                              type="number"
                              value={newVitals.heart_rate}
                              onChange={(e) => setNewVitals({...newVitals, heart_rate: e.target.value})}
                              placeholder="72"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Respiratory Rate</label>
                            <Input
                              type="number"
                              value={newVitals.respiratory_rate}
                              onChange={(e) => setNewVitals({...newVitals, respiratory_rate: e.target.value})}
                              placeholder="16"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">O2 Saturation (%)</label>
                            <Input
                              type="number"
                              value={newVitals.oxygen_saturation}
                              onChange={(e) => setNewVitals({...newVitals, oxygen_saturation: e.target.value})}
                              placeholder="98"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleAddVitals}>Save Vitals</Button>
                          <Button variant="outline" onClick={() => setIsAddingVitals(false)}>Cancel</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <VitalSigns 
                    patientId={selectedPatient}
                    patientName={displayName}
                    vitalSigns={chartData.vitalSigns}
                  />
                </div>
              </TabsContent>

              {/* Enhanced Medications Tab */}
              <TabsContent value="medications" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Medications</h3>
                    <Button onClick={() => setIsAddingMedication(true)} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Medication
                    </Button>
                  </div>
                  
                  {isAddingMedication && (
                    <Card>
                      <CardHeader>
                        <h4 className="font-medium">Add New Medication</h4>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Medication Name</label>
                            <Input
                              value={newMedication.medication_name}
                              onChange={(e) => setNewMedication({...newMedication, medication_name: e.target.value})}
                              placeholder="Lisinopril"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Dosage</label>
                            <Input
                              value={newMedication.dosage}
                              onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                              placeholder="10mg"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Frequency</label>
                            <Input
                              value={newMedication.frequency}
                              onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                              placeholder="Once daily"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Route</label>
                            <Input
                              value={newMedication.route}
                              onChange={(e) => setNewMedication({...newMedication, route: e.target.value})}
                              placeholder="Oral"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Instructions</label>
                          <Textarea
                            value={newMedication.instructions}
                            onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                            placeholder="Take with food"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleAddMedication}>Save Medication</Button>
                          <Button variant="outline" onClick={() => setIsAddingMedication(false)}>Cancel</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <MedicationsSection 
                    patientId={selectedPatient}
                    medications={chartData.medications}
                  />
                </div>
              </TabsContent>

              <TabsContent value="labs" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <LabResults 
                  patientId={selectedPatient}
                  labResults={chartData.labResults}
                />
              </TabsContent>

              <TabsContent value="imaging" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <ImagingRecords 
                  patientId={selectedPatient}
                  imagingRecords={chartData.imaging}
                />
              </TabsContent>

              <TabsContent value="notes" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <NotesSection 
                  patientId={selectedPatient}
                  providerId={userId}
                  notes={chartData.notes}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedPatientInterface;