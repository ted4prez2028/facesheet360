import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus } from "lucide-react";
import PatientDetailHeader from "./PatientDetailHeader";
import VitalSigns from "./VitalSigns";
import MedicationsSection from "./MedicationsSection";
import LabResultsPanel from "./LabResultsPanel";
import ImagingPanel from "./ImagingPanel";
import NotesSection from "./NotesSection";
import CareTeamAssignments from "@/components/patients/CareTeamAssignments";
import WoundCareTab from "@/components/patientview/WoundCareTab";
import TimelineTab from "@/components/patientview/TimelineTab";
import ProfileTab from "@/components/patientview/ProfileTab";
import { SOAPNoteTab } from "@/components/patientview/SOAPNoteTab";
import MedicalDiagnosesTab from "@/components/patientview/MedicalDiagnosesTab";
import AllergiesTab from "@/components/patientview/AllergiesTab";
import ImmunizationsTab from "@/components/patientview/ImmunizationsTab";
import PatientOverviewTab from "./PatientOverviewTab";
import { useAuth } from '@/context/AuthContext';
import { generateDischargeSummary } from '@/utils/dischargeSummaryNew';
import { DischargeFormData } from '@/types/discharge';
import { usePatientForms } from '@/hooks/usePatientForms';
import { usePatientData } from '@/hooks/usePatientData';

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

interface UnifiedPatientInterfaceProps {
  selectedPatient: string | null;
  patientData: LocalPatient | undefined;
  onBack: () => void;
  initialTab?: string;
}

const UnifiedPatientInterface = ({ 
  selectedPatient, 
  patientData, 
  onBack,
  initialTab 
}: UnifiedPatientInterfaceProps) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const { user } = useAuth();
  
  // Use custom hooks for data and forms
  const { chartData, enhancedPatientData, vitalSigns, medications, labResults } = usePatientData(selectedPatient, patientData);
  
  const {
    isAddingVitals,
    setIsAddingVitals,
    newVitals,
    setNewVitals,
    handleAddVitals,
    isAddingMedication,
    setIsAddingMedication,
    newMedication,
    setNewMedication,
    handleAddMedication,
    isEditingRoom,
    setIsEditingRoom,
    roomNumber,
    setRoomNumber,
    handleUpdateRoom,
  } = usePatientForms(selectedPatient, user?.id);

  // Sync room number with patient data
  useEffect(() => {
    if (patientData) {
      setRoomNumber((patientData as any).room_number || '');
    }
  }, [patientData, setRoomNumber]);

  // Handle initial tab and auto-show forms
  useEffect(() => {
    if (initialTab === 'vitals') {
      setIsAddingVitals(true);
    } else if (initialTab === 'medications') {
      setIsAddingMedication(true);
    }
  }, [initialTab, setIsAddingVitals, setIsAddingMedication]);

  const handleDischarge = async (formData: DischargeFormData) => {
    if (!selectedPatient) return;

    try {
      await generateDischargeSummary(selectedPatient, formData);
    } catch (error) {
      console.error('Error generating discharge summary:', error);
      // Error handling is done in generateDischargeSummary
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
            onDischarge={handleDischarge}
          />
          <div className="mt-4 flex items-center gap-2">
            <label className="text-sm font-medium">Room Number:</label>
            {isEditingRoom ? (
              <>
                <Input
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-32"
                  placeholder="e.g., 301B"
                />
                <Button size="sm" onClick={handleUpdateRoom}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditingRoom(false)}>Cancel</Button>
              </>
            ) : (
              <>
                <span className="text-sm">{roomNumber || 'Not assigned'}</span>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingRoom(true)}>Edit</Button>
              </>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col overflow-hidden p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="w-full flex flex-wrap gap-1 h-auto shrink-0">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="soap-notes">SOAP Notes</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="labs">Labs</TabsTrigger>
              <TabsTrigger value="imaging">Imaging</TabsTrigger>
              <TabsTrigger value="medical-diagnoses">Diagnoses</TabsTrigger>
              <TabsTrigger value="allergies">Allergies</TabsTrigger>
              <TabsTrigger value="wound-care">Wound Care</TabsTrigger>
              <TabsTrigger value="immunizations">Immunizations</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="care-team">Care Team</TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-4 overflow-hidden">
              {/* Overview Tab */}
              <TabsContent value="overview" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <PatientOverviewTab 
                  selectedPatient={selectedPatient}
                  vitalSigns={vitalSigns}
                  medications={medications}
                  labResults={labResults}
                />
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <TimelineTab patientId={selectedPatient} />
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <ProfileTab patientId={selectedPatient} />
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
                    medications={chartData.medications}
                  />
                </div>
              </TabsContent>

              {/* SOAP Notes Tab */}
              <TabsContent value="soap-notes" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <SOAPNoteTab patientId={selectedPatient} />
              </TabsContent>

              <TabsContent value="labs" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <LabResultsPanel patientId={selectedPatient} />
              </TabsContent>

              <TabsContent value="imaging" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <ImagingPanel patientId={selectedPatient} />
              </TabsContent>

              {/* Medical Diagnoses Tab */}
              <TabsContent value="medical-diagnoses" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <MedicalDiagnosesTab patientId={selectedPatient} />
              </TabsContent>

              {/* Allergies Tab */}
              <TabsContent value="allergies" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <AllergiesTab patientId={selectedPatient} />
              </TabsContent>

              {/* Wound Care Tab */}
              <TabsContent value="wound-care" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <WoundCareTab patientId={selectedPatient} />
              </TabsContent>

              {/* Immunizations Tab */}
              <TabsContent value="immunizations" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <ImmunizationsTab patientId={selectedPatient} />
              </TabsContent>

              <TabsContent value="notes" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <NotesSection 
                  notes={chartData.notes}
                />
              </TabsContent>

              <TabsContent value="care-team" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
                <CareTeamAssignments patientId={selectedPatient} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedPatientInterface;