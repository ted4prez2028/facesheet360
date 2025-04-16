
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usePatient } from '@/hooks/usePatient';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import AuthErrorAlert from '@/components/patients/AuthErrorAlert';
import { useAuth } from '@/context/AuthContext';
import { 
  FileText, 
  AlertCircle,
  Heart,
  Thermometer,
  Scale
} from 'lucide-react';
import PatientHeader from '@/components/patientview/PatientHeader';
import PatientTabs from '@/components/patientview/PatientTabs';
import CallLightButton from '@/components/call-light/CallLightButton';
import CallLightHistory from '@/components/call-light/CallLightHistory';

const PatientDetailView = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { patient, isLoading, error } = usePatient(patientId || "");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('contacts');
  
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

  // Simulated room number assignment - in a real app, this would be stored in the database
  const getRoomNumber = (patientId: string) => {
    // Hash the patient ID to generate a consistent room number
    const hashCode = (s: string) => {
      let h = 0;
      for(let i = 0; i < s.length; i++)
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
      return h;
    };
    
    // Generate a room number from 100-499
    const roomBase = Math.abs(hashCode(patientId)) % 400 + 100;
    return roomBase.toString();
  };

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

  const roomNumber = getRoomNumber(patient.id);
  const patientName = `${patient.first_name} ${patient.last_name}`;

  return (
    <DashboardLayout>
      <div className="container py-4 space-y-4">
        <div className="flex justify-between items-center">
          <PatientHeader 
            patient={patient} 
            calculateAge={calculateAge}
          />
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-medium">Room {roomNumber}</div>
              <div className="text-sm text-muted-foreground">Assigned Room</div>
            </div>
            
            <CallLightButton 
              patientId={patient.id}
              patientName={patientName}
              roomNumber={roomNumber}
            />
          </div>
        </div>
        
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
        
        {patientId && <PatientTabs patientId={patientId} />}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="md:col-span-3">
            {/* Main content area */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Call Light History</h3>
                {patientId && <CallLightHistory patientId={patientId} />}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-0">
                <div className="bg-blue-100 text-blue-800 py-2 px-4 font-medium">
                  Current Vitals
                </div>
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
      </div>
    </DashboardLayout>
  );
};

export default PatientDetailView;
