
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, Calendar, Loader2, Activity, FileText, Edit, User } from "lucide-react";
import { getPatientById } from "@/lib/supabaseApi";
import { Patient } from "@/types";
import FaceRegistration from "@/components/facial-recognition/FaceRegistration";
import { toast } from "sonner";

const PatientProfile = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFaceRegistration, setShowFaceRegistration] = useState(false);
  
  // Check if we should show face registration from query param
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('register-face') === 'true') {
      setShowFaceRegistration(true);
    }
  }, [location.search]);
  
  // Fetch patient data
  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;
      
      try {
        setIsLoading(true);
        const data = await getPatientById(patientId);
        if (data) {
          setPatient(data);
        } else {
          toast.error("Patient not found");
          navigate("/patients");
        }
      } catch (error) {
        console.error("Error fetching patient:", error);
        toast.error("Error loading patient information");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPatient();
  }, [patientId, navigate]);
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  const calculateAge = (dateOfBirth: string | undefined) => {
    if (!dateOfBirth) return "Unknown";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "stable":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "critical":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  };
  
  const handleFaceRegistrationComplete = () => {
    toast.success("Facial data has been registered successfully");
    setShowFaceRegistration(false);
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <Loader2 className="h-8 w-8 animate-spin text-health-600 mb-4" />
          <p className="text-muted-foreground">Loading patient information...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!patient) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <p className="text-muted-foreground">Patient not found</p>
          <Button 
            className="mt-4"
            variant="outline"
            onClick={() => navigate("/patients")}
          >
            Return to Patient List
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="p-0 h-8 w-8" 
            onClick={() => navigate("/patients")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Patient Profile</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Patient Information Card */}
          <Card className="shadow-sm md:col-span-1">
            <CardHeader className="text-center pb-2">
              <Avatar className="h-24 w-24 mx-auto mb-2">
                <AvatarFallback className="text-xl bg-health-100 text-health-700">
                  {getInitials(patient.first_name, patient.last_name)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">
                {patient.first_name} {patient.last_name}
              </CardTitle>
              <CardDescription>
                {calculateAge(patient.date_of_birth)} years old, {patient.gender}
              </CardDescription>
              <div className="mt-2">
                <Badge 
                  variant="outline" 
                  className={getStatusColor(patient.status)}
                >
                  {patient.status || 'Active'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Phone:</div>
                    <div>{patient.phone || 'None'}</div>
                    <div className="text-muted-foreground">Email:</div>
                    <div className="truncate">{patient.email || 'None'}</div>
                    <div className="text-muted-foreground">Address:</div>
                    <div>{patient.address || 'None'}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Medical Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">DOB:</div>
                    <div>{formatDate(patient.date_of_birth)}</div>
                    <div className="text-muted-foreground">MRN:</div>
                    <div>{patient.medical_record_number || 'None'}</div>
                    <div className="text-muted-foreground">Insurance:</div>
                    <div>{patient.insurance_provider || 'None'}</div>
                    <div className="text-muted-foreground">Policy #:</div>
                    <div>{patient.policy_number || 'None'}</div>
                    <div className="text-muted-foreground">Condition:</div>
                    <div>{patient.condition || 'General'}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <Button variant="outline" className="gap-2" size="sm">
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2" 
                    size="sm"
                    onClick={() => navigate(`/charting?patientId=${patient.id}`)}
                  >
                    <FileText className="h-4 w-4" />
                    <span>View Chart</span>
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2 w-full" 
                    size="sm"
                  >
                    <Activity className="h-4 w-4" />
                    <span>Vital Signs</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2 w-full" 
                    size="sm"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Schedule</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Patient Details Tabs */}
          <div className="md:col-span-2 space-y-6">
            {/* Face Registration Card if needed */}
            {(showFaceRegistration || !patient.facial_data) && (
              <FaceRegistration 
                patientId={patient.id}
                onComplete={handleFaceRegistrationComplete}
              />
            )}
            
            <Tabs defaultValue="summary">
              <TabsList className="mb-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="history">Medical History</TabsTrigger>
                <TabsTrigger value="medications">Medications</TabsTrigger>
                <TabsTrigger value="allergies">Allergies</TabsTrigger>
                <TabsTrigger value="visits">Recent Visits</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary">
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      This is a summary of {patient.first_name}'s health status and recent visits.
                    </p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-base font-medium mb-2">Current Condition</h3>
                        <p>{patient.condition || 'No current conditions noted.'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-base font-medium mb-2">Recent Vital Signs</h3>
                        {patient.vitalSigns ? (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Blood Pressure:</span>
                              <span>{patient.vitalSigns.bloodPressure || 'Not recorded'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Heart Rate:</span>
                              <span>{patient.vitalSigns.heartRate || 'Not recorded'} bpm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Temperature:</span>
                              <span>{patient.vitalSigns.temperature || 'Not recorded'} °F</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Oxygen Saturation:</span>
                              <span>{patient.vitalSigns.oxygenSaturation || 'Not recorded'}%</span>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-muted-foreground">Recorded:</span>
                              <span>{patient.vitalSigns.recordedAt ? formatDate(patient.vitalSigns.recordedAt) : 'Unknown'}</span>
                            </div>
                          </div>
                        ) : (
                          <p>No vital signs recorded.</p>
                        )}
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">Active Medications</h3>
                      {patient.medications && patient.medications.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {patient.medications.map((med, index) => (
                            <li key={index}>{med}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No active medications.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2">
                        {patient.medicalHistory.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No medical history recorded.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="medications">
                <Card>
                  <CardHeader>
                    <CardTitle>Medications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patient.medications && patient.medications.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2">
                        {patient.medications.map((med, index) => (
                          <li key={index}>{med}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No medications prescribed.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="allergies">
                <Card>
                  <CardHeader>
                    <CardTitle>Allergies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patient.allergies && patient.allergies.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2">
                        {patient.allergies.map((allergy, index) => (
                          <li key={index}>{allergy}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No known allergies.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="visits">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Visits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>No recent visits recorded.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientProfile;
