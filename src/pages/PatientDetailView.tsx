
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usePatient } from '@/hooks/usePatient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import AuthErrorAlert from '@/components/patients/AuthErrorAlert';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { 
  FileText, 
  AlertCircle,
  Heart,
  Thermometer,
  Scale
} from 'lucide-react';
import { CareTeamAssignments } from '@/components/patients/CareTeamAssignments';
import ContactsList from '@/components/patientview/ContactsList';
import MedicalProfessionalsList from '@/components/patientview/MedicalProfessionalsList';
import PatientHeader from '@/components/patientview/PatientHeader';

const PatientDetailView = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { patient, isLoading, error } = usePatient(patientId || "");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('contacts');
  
  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  // Mock vital signs data based on the screenshot
  const vitalSigns = {
    bloodPressure: "128/81 mmHg",
    bpDate: "4/7/2025 07:18",
    temperature: "98.3 °F",
    tempDate: "3/31/2025 07:54",
    pulse: "95 bpm",
    pulseDate: "4/7/2025 07:18",
    oxygenSaturation: "O2:97 %",
    oxDate: "4/7/2025 07:18",
    respiratoryRate: "16",
    rrDate: "4/7/2025 07:18",
    weight: "196.6 lbs",
    weightDate: "4/12/025 09:08",
    pain: "7",
    painDate: "4/15/2025 08:36"
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container py-6 space-y-6">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated || error) {
    return (
      <DashboardLayout>
        <div className="container py-6 space-y-8">
          <AuthErrorAlert isAuthenticated={isAuthenticated} error={error} refetch={() => window.location.reload()} />
          
          <Button variant="outline" asChild>
            <Link to="/patients">Back to Patients</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="container py-6 space-y-8">
          <h1 className="text-2xl font-bold">Patient Not Found</h1>
          <p className="text-muted-foreground">The patient you are looking for could not be found.</p>
          <Button variant="outline" asChild>
            <Link to="/patients">Back to Patients</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container py-4 space-y-4">
        <PatientHeader 
          patient={patient} 
          calculateAge={calculateAge}
        />
        
        {/* Allergies and Code Status Section */}
        <div className="grid gap-4">
          <div className="bg-red-50 p-3 border border-red-200 rounded-md">
            <div className="font-semibold flex items-center text-red-700">
              <AlertCircle className="mr-2 h-4 w-4" /> 
              Allergies:
            </div>
            <div className="text-red-700 mt-1">risperiDONE, Haloperidol and Related</div>
          </div>
          
          <div className="bg-blue-50 p-3 border border-blue-200 rounded-md">
            <div className="font-semibold flex items-center">
              <FileText className="mr-2 h-4 w-4" /> 
              Code Status:
            </div>
            <div className="mt-1">(Advance Directives) DNAR - Do Not Attempt Resuscitation (Allow Natural Death) Comfort measures only</div>
          </div>
          
          <div className="bg-gray-50 p-3 border border-gray-200 rounded-md">
            <div className="font-semibold flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" /> 
              Special Instructions:
            </div>
            <div className="mt-1">"Cares pairs"</div>
          </div>
        </div>
        
        {/* Main Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-gray-100 border-b border-gray-300">
            <div className="container overflow-x-auto">
              <TabsList className="bg-transparent h-12 w-auto inline-flex">
                <TabsTrigger className="data-[state=active]:bg-white" value="dash">Dash</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white" value="profile">Profile</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white" value="census">Census</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white" value="med-diag">Med Diag</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white" value="allergy">Allergy</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white" value="immun">Immun</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white" value="orders">Orders</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white" value="vitals">Wks/Vitals</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white" value="results">Results</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white" value="mds">MDS</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white" value="evaluations">Evaluations</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white" value="skin">Skin and Wound</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white" value="therapy">Therapy</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white" value="prog">Prog Note</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white" value="care-plan">Care Plan</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white" value="tasks">Tasks</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white" value="documents">Documents</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white" value="contacts">Contacts</TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          {/* Vital Signs Card */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-3">
              <TabsContent value="dash">
                <p>Dashboard content here</p>
              </TabsContent>
              
              <TabsContent value="contacts" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Contacts</h2>
                  <Button>Add</Button>
                </div>
                
                <ContactsList 
                  patient={patient}
                  onEdit={(id) => console.log('Edit contact:', id)} 
                  onDelete={(id) => console.log('Delete contact:', id)}
                />
                
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Medical Professionals</h2>
                    <Button>Modify</Button>
                  </div>
                  
                  <MedicalProfessionalsList 
                    onViewProfile={(id) => console.log('View profile:', id)}
                    onClearPrimaryPhysician={() => console.log('Clear primary physician')}
                  />
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-end space-x-4">
                    <Button variant="outline">
                      <Link to={`/patients/${patientId}`}>Admission Record</Link>
                    </Button>
                    <Button variant="outline">
                      <Link to={`/patients/${patientId}`}>Transfer / Discharge Record</Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              {/* Add content for other tabs */}
              <TabsContent value="vitals">
                <p>Vitals content here</p>
              </TabsContent>
              
              <TabsContent value="profile">
                <p>Profile content here</p>
              </TabsContent>
              
              <TabsContent value="census">
                <p>Census content here</p>
              </TabsContent>
              
              <TabsContent value="med-diag">
                <p>Medical diagnostics content here</p>
              </TabsContent>
              
              <TabsContent value="allergy">
                <p>Allergy content here</p>
              </TabsContent>
              
              <TabsContent value="immun">
                <p>Immunizations content here</p>
              </TabsContent>
              
              <TabsContent value="orders">
                <p>Orders content here</p>
              </TabsContent>
              
              <TabsContent value="results">
                <p>Results content here</p>
              </TabsContent>
              
              <TabsContent value="mds">
                <p>MDS content here</p>
              </TabsContent>
              
              <TabsContent value="evaluations">
                <p>Evaluations content here</p>
              </TabsContent>
              
              <TabsContent value="skin">
                <p>Skin and wound content here</p>
              </TabsContent>
              
              <TabsContent value="therapy">
                <p>Therapy content here</p>
              </TabsContent>
              
              <TabsContent value="prog">
                <p>Progress notes content here</p>
              </TabsContent>
              
              <TabsContent value="care-plan">
                <p>Care plan content here</p>
              </TabsContent>
              
              <TabsContent value="tasks">
                <p>Tasks content here</p>
              </TabsContent>
              
              <TabsContent value="documents">
                <p>Documents content here</p>
              </TabsContent>
            </div>
            
            <div>
              <Card>
                <CardHeader className="bg-blue-100 text-blue-800 py-2 px-4">
                  <CardTitle className="text-base">Current Vitals</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 divide-x divide-y">
                    <div className="p-2">
                      <div className="text-xs text-gray-600">BP:</div>
                      <div className="font-semibold">{vitalSigns.bloodPressure}</div>
                      <div className="text-xs text-gray-500">{vitalSigns.bpDate}</div>
                    </div>
                    <div className="p-2">
                      <div className="text-xs text-gray-600">Temp:</div>
                      <div className="font-semibold">{vitalSigns.temperature}</div>
                      <div className="text-xs text-gray-500">{vitalSigns.tempDate}</div>
                    </div>
                    <div className="p-2">
                      <div className="text-xs text-gray-600">Pulse:</div>
                      <div className="font-semibold">{vitalSigns.pulse}</div>
                      <div className="text-xs text-gray-500">{vitalSigns.pulseDate}</div>
                    </div>
                    <div className="p-2">
                      <div className="text-xs text-gray-600">Weight:</div>
                      <div className="font-semibold">{vitalSigns.weight}</div>
                      <div className="text-xs text-gray-500">{vitalSigns.weightDate}</div>
                    </div>
                    <div className="p-2">
                      <div className="text-xs text-gray-600">O2:</div>
                      <div className="font-semibold">{vitalSigns.oxygenSaturation}</div>
                      <div className="text-xs text-gray-500">{vitalSigns.oxDate}</div>
                    </div>
                    <div className="p-2">
                      <div className="text-xs text-gray-600">Pain:</div>
                      <div className="font-semibold">{vitalSigns.pain}</div>
                      <div className="text-xs text-gray-500">{vitalSigns.painDate}</div>
                    </div>
                    <div className="p-2 col-span-2">
                      <div className="text-xs text-gray-600">Resp:</div>
                      <div className="font-semibold">{vitalSigns.respiratoryRate}</div>
                      <div className="text-xs text-gray-500">{vitalSigns.rrDate}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PatientDetailView;
