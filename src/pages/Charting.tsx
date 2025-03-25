
import { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
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
import { Label } from "@/components/ui/label";
import { 
  PlusCircle, 
  MoreHorizontal, 
  Search, 
  User, 
  FileText, 
  Calendar, 
  PenTool,
  FilePlus,
  Loader2,
  Activity
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

const Charting = () => {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mock data
  const patients = [
    {
      id: "P001",
      name: "John Smith",
      age: 45,
      status: "Active",
      lastVisit: "2023-06-15",
      imgUrl: null,
    },
    {
      id: "P002",
      name: "Maria Rodriguez",
      age: 32,
      status: "Active",
      lastVisit: "2023-06-20",
      imgUrl: null,
    },
    {
      id: "P003",
      name: "Robert Johnson",
      age: 67,
      status: "Critical",
      lastVisit: "2023-06-22",
      imgUrl: null,
    },
    {
      id: "P004",
      name: "Emily Davis",
      age: 28,
      status: "Stable",
      lastVisit: "2023-06-18",
      imgUrl: null,
    },
  ];
  
  const selectedPatientData = patients.find(p => p.id === selectedPatient);
  
  const notes = [
    {
      id: "N001",
      patientId: "P001",
      date: "2023-06-15T10:30:00",
      provider: "Dr. Jane Wilson",
      type: "Progress Note",
      content: "Patient presents with persistent headaches for the past week. Reports pain level of 7/10. Prescribed acetaminophen 500mg every 6 hours and recommended rest.",
    },
    {
      id: "N002",
      patientId: "P001",
      date: "2023-06-10T14:15:00",
      provider: "Dr. Jane Wilson",
      type: "Lab Results",
      content: "CBC results show normal white blood cell count. Blood pressure slightly elevated at 140/90. Recommended lifestyle modifications including reduced sodium intake and increased physical activity.",
    },
    {
      id: "N003",
      patientId: "P002",
      date: "2023-06-20T09:45:00",
      provider: "Dr. Jane Wilson",
      type: "Progress Note",
      content: "Regular prenatal checkup. Fetal heartbeat normal at 140 bpm. Mother's weight gain is on track. No concerns at this time.",
    },
    {
      id: "N004",
      patientId: "P003",
      date: "2023-06-22T16:00:00",
      provider: "Dr. Michael Chen",
      type: "Progress Note",
      content: "Patient experiencing increased difficulty breathing. Oxygen saturation at 92%. Adjusted medication and scheduled follow-up in 3 days.",
    },
  ];
  
  const patientNotes = selectedPatient 
    ? notes.filter(note => note.patientId === selectedPatient)
    : [];
  
  const filteredPatients = searchQuery 
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).format(date);
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
  
  const handleSaveNote = () => {
    if (!noteText.trim()) {
      toast({
        title: "Note cannot be empty",
        description: "Please enter content for your note",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreatingNote(false);
    setNoteText("");
    
    toast({
      title: "Note saved",
      description: "Your note has been saved successfully",
    });
  };
  
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
        {/* Patient List Section */}
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
                <div className="space-y-1">
                  {filteredPatients.map((patient) => (
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
                          <span>{patient.id}</span>
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
                  ))}
                  
                  {filteredPatients.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No patients found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-3">
              <Button className="w-full gap-2 bg-health-600 hover:bg-health-700">
                <PlusCircle className="h-4 w-4" />
                <span>Add Patient</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Charting Area */}
        <div className="flex-1 flex flex-col h-full">
          {selectedPatient ? (
            <Card className="shadow-sm flex-1 flex flex-col">
              <CardHeader className="pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedPatientData?.name}</CardTitle>
                    <CardDescription>
                      {selectedPatientData?.id} • {selectedPatientData?.age} years old
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
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
                    <TabsTrigger value="meds">Medications</TabsTrigger>
                    <TabsTrigger value="labs">Lab Results</TabsTrigger>
                    <TabsTrigger value="imaging">Imaging</TabsTrigger>
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
                            <CardTitle className="text-base">New Progress Note</CardTitle>
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
                      
                      {patientNotes.map((note) => (
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
                      ))}
                      
                      {patientNotes.length === 0 && !isCreatingNote && (
                        <div className="text-center py-10 text-muted-foreground">
                          No notes found for this patient. Create a new note to get started.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="vitals" className="flex-1 flex flex-col m-0">
                  <div className="px-6 py-3 border-b flex items-center justify-between">
                    <h3 className="font-medium">Vital Signs</h3>
                    <Button 
                      className="gap-2 bg-health-600 hover:bg-health-700"
                      size="sm"
                    >
                      <Activity className="h-4 w-4" />
                      <span>Record Vitals</span>
                    </Button>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <p>Vital signs tracking is coming soon</p>
                      <Button variant="link" className="mt-2">
                        Add Vital Data
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="meds" className="m-0">
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <p>Medications management is coming soon</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="labs" className="m-0">
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <p>Lab results tracking is coming soon</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="imaging" className="m-0">
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <p>Imaging records are coming soon</p>
                    </div>
                  </div>
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
  );
};

export default Charting;
