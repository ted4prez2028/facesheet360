import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  PlusCircle, 
  MoreHorizontal, 
  Search, 
  User, 
  FileText, 
  Calendar, 
  PenTool,
  FilePlus,
  Activity,
  Pill,
  TestTube,
  Image
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import VitalSignsPanel from "@/components/charting/VitalSignsPanel";
import LabResultsPanel from "@/components/charting/LabResultsPanel";
import MedicationsPanel from "@/components/charting/MedicationsPanel";
import ImagingPanel from "@/components/charting/ImagingPanel";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import PatientFormFields from "@/components/patients/PatientFormFields";
import PatientFacialCapture from "@/components/patients/PatientFacialCapture";
import { usePatientForm } from "@/hooks/usePatientForm";

interface Patient {
  id: string;
  name: string;
  age: number;
  status: string;
  lastVisit: string;
  imgUrl: string | null;
}

interface Note {
  id: string;
  patientId: string;
  date: string;
  provider: string;
  type: string;
  content: string;
}

const Charting = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("Progress Note");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['charting-patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          id,
          first_name,
          last_name,
          date_of_birth,
          gender,
          facial_data
        `)
        .order('last_name', { ascending: true });
        
      if (error) throw error;
      
      return data.map(patient => ({
        id: patient.id,
        name: `${patient.first_name} ${patient.last_name}`,
        age: calculateAge(patient.date_of_birth),
        status: "Active",
        lastVisit: new Date().toISOString().split('T')[0],
        imgUrl: null
      }));
    },
    enabled: !!user?.id
  });
  
  const { data: notes, isLoading: isLoadingNotes, refetch: refetchNotes } = useQuery({
    queryKey: ['patient-notes', selectedPatient],
    queryFn: async () => {
      if (!selectedPatient) return [];
      
      const { data, error } = await supabase
        .from('chart_records')
        .select(`
          id,
          patient_id,
          provider_id,
          record_date,
          record_type,
          diagnosis,
          notes,
          users:provider_id (name)
        `)
        .eq('patient_id', selectedPatient)
        .eq('record_type', 'note')
        .order('record_date', { ascending: false });
        
      if (error) throw error;
      
      return data.map(note => ({
        id: note.id,
        patientId: note.patient_id,
        date: note.record_date,
        provider: note.users?.name || 'Unknown Provider',
        type: note.diagnosis || 'Progress Note',
        content: note.notes || ''
      }));
    },
    enabled: !!selectedPatient
  });
  
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
  
  const filteredPatients = searchQuery && patients 
    ? patients.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.id.toLowerCase().includes(searchQuery.toLowerCase()))
    : patients;
    
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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
  
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const handleSaveNote = async () => {
    if (!noteText.trim()) {
      toast({
        title: "Note cannot be empty",
        description: "Please enter content for your note",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedPatient || !user?.id) {
      toast({
        title: "Error",
        description: "Patient or provider information is missing",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('chart_records')
        .insert({
          patient_id: selectedPatient,
          provider_id: user.id,
          record_type: 'note',
          record_date: new Date().toISOString(),
          diagnosis: noteType,
          notes: noteText
        })
        .select();
        
      if (error) throw error;
      
      setIsCreatingNote(false);
      setNoteText("");
      setNoteType("Progress Note");
      refetchNotes();
      
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error saving note",
        description: "An error occurred while saving your note",
        variant: "destructive",
      });
    }
  };
  
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const selectedPatientData = patients?.find(p => p.id === selectedPatient);

  const {
    formState,
    updateField,
    handleFacialDataCapture,
    resetForm,
    submitForm,
  } = usePatientForm(() => {
    setIsAddPatientOpen(false);
    toast({
      title: "Patient added",
      description: "Patient has been added successfully",
    });
  });

  const handleSubmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  return (
    <>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
          <div className="w-full md:w-80 flex flex-col">
            <Card className="shadow-sm flex-1 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Patients</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="px-1.5 py-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-3">
                  {isLoadingPatients ? (
                    <div className="space-y-2 p-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center p-3 rounded-md animate-pulse">
                          <div className="h-9 w-9 rounded-full bg-gray-200 mr-3"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredPatients && filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <button
                            key={patient.id}
                            className={`w-full flex items-center p-3 rounded-md text-left hover:bg-muted transition-colors ${
                              selectedPatient === patient.id ? "bg-muted" : ""
                            }`}
                            onClick={() => setSelectedPatient(patient.id)}
                          >
                            <Avatar className="h-9 w-9 mr-3">
                              <AvatarImage src={patient.imgUrl || ""} alt={patient.name} />
                              <AvatarFallback className="text-xs">
                                {patient.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{patient.name}</div>
                              <div className="text-xs text-muted-foreground flex gap-2 items-center mt-0.5">
                                <span>{patient.id.substring(0, 8)}</span>
                                <span>•</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs py-0 h-5 ${getStatusColor(patient.status)}`}
                                >
                                  {patient.status}
                                </Badge>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No patients found
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter className="border-t p-3">
                <Button 
                  className="w-full gap-2 bg-health-600 hover:bg-health-700"
                  onClick={() => setIsAddPatientOpen(true)}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Patient</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="flex-1 flex flex-col h-full">
            {selectedPatient ? (
              <Card className="shadow-sm flex-1 flex flex-col">
                <CardHeader className="pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedPatientData?.name}</CardTitle>
                      <CardDescription>
                        {selectedPatientData?.id.substring(0, 8)} • {selectedPatientData?.age} years old
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="gap-2" size="sm">
                        <Calendar className="h-4 w-4" />
                        <span>Schedule</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <User className="h-4 w-4 mr-2" />
                            <span>View Profile</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            <span>Full History</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Activity className="h-4 w-4 mr-2" />
                            <span>Vital Signs</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                
                <Tabs defaultValue="notes" className="flex-1 flex flex-col">
                  <div className="px-6">
                    <TabsList className="my-2">
                      <TabsTrigger value="notes" className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>Notes</span>
                      </TabsTrigger>
                      <TabsTrigger value="vitals" className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        <span>Vital Signs</span>
                      </TabsTrigger>
                      <TabsTrigger value="meds" className="flex items-center gap-1">
                        <Pill className="h-4 w-4" />
                        <span>Medications</span>
                      </TabsTrigger>
                      <TabsTrigger value="labs" className="flex items-center gap-1">
                        <TestTube className="h-4 w-4" />
                        <span>Lab Results</span>
                      </TabsTrigger>
                      <TabsTrigger value="imaging" className="flex items-center gap-1">
                        <Image className="h-4 w-4" />
                        <span>Imaging</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="notes" className="flex-1 flex flex-col pt-0 px-0 m-0">
                    <div className="px-6 py-3 border-b flex items-center justify-between">
                      <h3 className="font-medium">Patient Notes</h3>
                      <Button 
                        className="gap-2 bg-health-600 hover:bg-health-700"
                        size="sm"
                        onClick={() => setIsCreatingNote(true)}
                      >
                        <PenTool className="h-4 w-4" />
                        <span>New Note</span>
                      </Button>
                    </div>
                    
                    <ScrollArea className="flex-1">
                      <div className="px-6 py-2">
                        {isCreatingNote && (
                          <Card className="mb-4 border-health-200 shadow-md">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-base">New Note</CardTitle>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      {noteType}
                                      <MoreHorizontal className="h-4 w-4 ml-2" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setNoteType("Progress Note")}>
                                      Progress Note
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setNoteType("Consultation")}>
                                      Consultation
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setNoteType("Procedure Note")}>
                                      Procedure Note
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setNoteType("Discharge Summary")}>
                                      Discharge Summary
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <Textarea 
                                placeholder="Enter your note here..."
                                className="min-h-[120px]"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                              />
                              
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={handleFileUpload}
                                >
                                  <FilePlus className="h-4 w-4 mr-2" />
                                  Attach File
                                </Button>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  ref={fileInputRef}
                                />
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 pt-0">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setIsCreatingNote(false);
                                  setNoteText("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                size="sm"
                                className="bg-health-600 hover:bg-health-700"
                                onClick={handleSaveNote}
                              >
                                Save Note
                              </Button>
                            </CardFooter>
                          </Card>
                        )}
                        
                        {isLoadingNotes ? (
                          <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                              <Card key={i} className="animate-pulse">
                                <CardHeader className="pb-2">
                                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </CardHeader>
                                <CardContent>
                                  <div className="h-16 bg-gray-200 rounded w-full"></div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : notes && notes.length > 0 ? (
                          notes.map((note) => (
                            <Card key={note.id} className="mb-4">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-base">{note.type}</CardTitle>
                                    <CardDescription>
                                      {formatDateTime(note.date)} by {note.provider}
                                    </CardDescription>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>Edit</DropdownMenuItem>
                                      <DropdownMenuItem>Print</DropdownMenuItem>
                                      <DropdownMenuItem>Share</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm">{note.content}</p>
                              </CardContent>
                            </Card>
                          ))
                        ) : !isCreatingNote && (
                          <div className="text-center py-10 text-muted-foreground">
                            <FileText className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                            <p>No notes found for this patient</p>
                            <p className="text-sm mt-1">Create a new note to get started</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="vitals" className="flex-1 flex flex-col m-0 px-6 py-3 overflow-hidden">
                    <VitalSignsPanel patientId={selectedPatient} />
                  </TabsContent>
                  
                  <TabsContent value="meds" className="flex-1 flex flex-col m-0 px-6 py-3 overflow-hidden">
                    <MedicationsPanel patientId={selectedPatient} />
                  </TabsContent>
                  
                  <TabsContent value="labs" className="flex-1 flex flex-col m-0 px-6 py-3 overflow-hidden">
                    <LabResultsPanel patientId={selectedPatient} />
                  </TabsContent>
                  
                  <TabsContent value="imaging" className="flex-1 flex flex-col m-0 px-6 py-3 overflow-hidden">
                    <ImagingPanel patientId={selectedPatient} />
                  </TabsContent>
                </Tabs>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg border border-dashed">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Select a Patient</h3>
                  <p className="text-muted-foreground">
                    Choose a patient from the list to start charting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>

      <Sheet open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
        <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Add New Patient</SheetTitle>
            <SheetDescription>
              Fill in the patient details below. Fields marked with * are required.
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSubmitPatient} className="space-y-6">
            <PatientFormFields
              formData={formState}
              onChange={updateField}
            />
            
            <PatientFacialCapture
              facialData={formState.facialData}
              onCapture={handleFacialDataCapture}
            />
            
            <SheetFooter className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button 
                type="submit" 
                className="w-full sm:w-auto flex items-center bg-health-600 hover:bg-health-700" 
                disabled={formState.isLoading}
              >
                {formState.isLoading ? "Adding Patient..." : "Submit Patient"}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsAddPatientOpen(false);
                }} 
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Charting;
