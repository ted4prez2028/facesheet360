
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Calendar,
  CheckCircle, 
  ChevronDown, 
  ChevronLeft, 
  ClipboardList, 
  Clock, 
  FileText, 
  HeartPulse, 
  MoreHorizontal, 
  Pill, 
  Plus, 
  Stethoscope, 
  Thermometer 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Charting = () => {
  const [patient, setPatient] = useState({
    id: "P003",
    name: "Robert Johnson",
    age: 67,
    gender: "Male",
    dob: "1956-09-15",
    bloodType: "O+",
    allergies: ["Penicillin", "Sulfa drugs"],
    primaryCondition: "Diabetes Type 2",
    assignedDoctor: "Dr. Jane Smith"
  });
  
  const [vitalSigns, setVitalSigns] = useState({
    temperature: "",
    heartRate: "",
    bloodPressure: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    bmi: "",
    pain: ""
  });
  
  const [notesText, setNotesText] = useState("");
  const [diagnosisText, setDiagnosisText] = useState("");
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  
  const { toast } = useToast();
  
  const handleVitalChange = (field: string, value: string) => {
    setVitalSigns({
      ...vitalSigns,
      [field]: value
    });
    
    // If we're updating height or weight, recalculate BMI
    if (field === "height" || field === "weight") {
      const height = field === "height" ? parseFloat(value) : parseFloat(vitalSigns.height);
      const weight = field === "weight" ? parseFloat(value) : parseFloat(vitalSigns.weight);
      
      if (height && weight) {
        // BMI = weight (kg) / (height (m))^2
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        setVitalSigns(prev => ({
          ...prev,
          bmi
        }));
      }
    }
  };
  
  const handleSaveChart = () => {
    // Here would be API call to save the chart data
    // For demo, just simulate a successful save
    
    toast({
      title: "Chart Saved",
      description: "Patient chart has been updated successfully.",
      duration: 3000,
    });
    
    // Also simulate earning CareCoins
    toast({
      title: "CareCoins Earned",
      description: "You've earned 25 CareCoins for completing this chart.",
      duration: 3000,
    });
  };
  
  const availableMedications = [
    "Metformin 500mg",
    "Lisinopril 10mg",
    "Atorvastatin 20mg",
    "Glipizide 5mg",
    "Aspirin 81mg",
    "Insulin Glargine",
    "Hydrochlorothiazide 25mg"
  ];
  
  const recentChartEntries = [
    {
      id: 1,
      date: "2023-06-18",
      provider: "Dr. Michael Chen",
      type: "Follow-up",
      notes: "Patient reports improved blood glucose levels. Continuing current medication regimen."
    },
    {
      id: 2,
      date: "2023-05-30",
      provider: "Dr. Sarah Lee",
      type: "Lab Review",
      notes: "A1C improved to 7.2 from 8.1. LDL slightly elevated at 110 mg/dL."
    },
    {
      id: 3,
      date: "2023-05-12",
      provider: "Dr. Jane Wilson",
      type: "Regular Check-up",
      notes: "Patient reports occasional dizziness in the mornings. Adjusting insulin dosage."
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                Patient Chart
                <span className="text-muted-foreground">|</span>
                <span>{patient.name}</span>
              </h1>
            </div>
            <p className="text-muted-foreground ml-10">
              {patient.age} year old {patient.gender} • ID: {patient.id} • DOB: {patient.dob}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              <span>View History</span>
            </Button>
            <Button 
              className="gap-2 bg-health-600 hover:bg-health-700"
              onClick={handleSaveChart}
            >
              <CheckCircle className="h-4 w-4" />
              <span>Save Chart</span>
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-muted-foreground" />
                  Vital Signs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature" className="text-sm">Temperature (°C)</Label>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="temperature" 
                        placeholder="36.5" 
                        value={vitalSigns.temperature}
                        onChange={(e) => handleVitalChange("temperature", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="heartRate" className="text-sm">Heart Rate (bpm)</Label>
                    <div className="flex items-center gap-2">
                      <HeartPulse className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="heartRate" 
                        placeholder="75" 
                        value={vitalSigns.heartRate}
                        onChange={(e) => handleVitalChange("heartRate", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bloodPressure" className="text-sm">Blood Pressure (mmHg)</Label>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="bloodPressure" 
                        placeholder="120/80" 
                        value={vitalSigns.bloodPressure}
                        onChange={(e) => handleVitalChange("bloodPressure", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="respiratoryRate" className="text-sm">Respiratory Rate</Label>
                    <Input 
                      id="respiratoryRate" 
                      placeholder="16" 
                      value={vitalSigns.respiratoryRate}
                      onChange={(e) => handleVitalChange("respiratoryRate", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="oxygenSaturation" className="text-sm">Oxygen Saturation (%)</Label>
                    <Input 
                      id="oxygenSaturation" 
                      placeholder="98" 
                      value={vitalSigns.oxygenSaturation}
                      onChange={(e) => handleVitalChange("oxygenSaturation", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pain" className="text-sm">Pain (0-10)</Label>
                    <Select 
                      onValueChange={(value) => handleVitalChange("pain", value)}
                      value={vitalSigns.pain}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pain level" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                          <SelectItem key={level} value={level.toString()}>
                            {level} - {level === 0 ? "No Pain" : level < 4 ? "Mild" : level < 7 ? "Moderate" : "Severe"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-sm">Weight (kg)</Label>
                    <Input 
                      id="weight" 
                      placeholder="75.5" 
                      value={vitalSigns.weight}
                      onChange={(e) => handleVitalChange("weight", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-sm">Height (cm)</Label>
                    <Input 
                      id="height" 
                      placeholder="175" 
                      value={vitalSigns.height}
                      onChange={(e) => handleVitalChange("height", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bmi" className="text-sm">BMI</Label>
                    <Input 
                      id="bmi" 
                      placeholder="Calculated" 
                      value={vitalSigns.bmi}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-muted-foreground" />
                  Notes & Observations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="soap">
                  <TabsList>
                    <TabsTrigger value="soap">SOAP</TabsTrigger>
                    <TabsTrigger value="narrative">Narrative</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="soap" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Subjective</Label>
                      <Textarea 
                        placeholder="Patient reports..."
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Objective</Label>
                      <Textarea 
                        placeholder="Upon examination..."
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Assessment</Label>
                      <Textarea 
                        placeholder="Based on findings..."
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Plan</Label>
                      <Textarea 
                        placeholder="Treatment plan includes..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="narrative" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Clinical Notes</Label>
                      <Textarea 
                        placeholder="Enter your observations and notes here..."
                        className="min-h-[300px]"
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="templates" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="justify-start text-left h-auto py-3">
                        <div>
                          <div className="font-medium">Diabetes Follow-up</div>
                          <div className="text-sm text-muted-foreground">
                            Template for routine diabetes management
                          </div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="justify-start text-left h-auto py-3">
                        <div>
                          <div className="font-medium">Cardiac Assessment</div>
                          <div className="text-sm text-muted-foreground">
                            Template for cardiovascular evaluation
                          </div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="justify-start text-left h-auto py-3">
                        <div>
                          <div className="font-medium">Physical Examination</div>
                          <div className="text-sm text-muted-foreground">
                            Comprehensive physical exam template
                          </div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="justify-start text-left h-auto py-3">
                        <div>
                          <div className="font-medium">Mental Health Assessment</div>
                          <div className="text-sm text-muted-foreground">
                            Template for psychological evaluation
                          </div>
                        </div>
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Diagnosis & Treatment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Diagnosis</Label>
                    <Textarea 
                      placeholder="Enter diagnosis..."
                      className="min-h-[80px]"
                      value={diagnosisText}
                      onChange={(e) => setDiagnosisText(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Treatment Plan</Label>
                    <Textarea 
                      placeholder="Enter treatment plan..."
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Medications</Label>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        <span>Add</span>
                      </Button>
                    </div>
                    
                    <div className="border rounded-md">
                      {selectedMedications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          No medications added
                        </div>
                      ) : (
                        <div className="divide-y">
                          {selectedMedications.map((med, index) => (
                            <div key={index} className="p-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Pill className="h-4 w-4 text-muted-foreground" />
                                <span>{med}</span>
                              </div>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 p-2 border rounded-md bg-muted/50">
                      <div className="text-sm font-medium mb-2">Suggested Medications</div>
                      <div className="flex flex-wrap gap-2">
                        {availableMedications.map((med, index) => (
                          <Button 
                            key={index} 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                              if (!selectedMedications.includes(med)) {
                                setSelectedMedications([...selectedMedications, med]);
                              }
                            }}
                          >
                            {med}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Follow-up</Label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select follow-up type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="office">Office Visit</SelectItem>
                            <SelectItem value="telehealth">Telehealth</SelectItem>
                            <SelectItem value="lab">Lab Work</SelectItem>
                            <SelectItem value="specialist">Specialist Referral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex-1">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1week">1 Week</SelectItem>
                            <SelectItem value="2weeks">2 Weeks</SelectItem>
                            <SelectItem value="1month">1 Month</SelectItem>
                            <SelectItem value="3months">3 Months</SelectItem>
                            <SelectItem value="6months">6 Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button variant="outline">
                      Save Draft
                    </Button>
                    <Button className="bg-health-600 hover:bg-health-700" onClick={handleSaveChart}>
                      Complete Chart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Patient Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-lg font-semibold">{patient.name.split(" ").map(n => n[0]).join("")}</span>
                  </div>
                  <div>
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {patient.bloodType} • {patient.primaryCondition}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Date of Birth</span>
                    <span className="text-sm font-medium">{patient.dob}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Allergies</span>
                    <div className="flex flex-col items-end">
                      {patient.allergies.map((allergy, index) => (
                        <span key={index} className="text-sm font-medium">{allergy}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Primary Provider</span>
                    <span className="text-sm font-medium">{patient.assignedDoctor}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" className="justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Medical Records
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Activity className="h-4 w-4 mr-2" />
                      Lab Results
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Pill className="h-4 w-4 mr-2" />
                      Medications
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Chart History</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {recentChartEntries.map((entry) => (
                    <AccordionItem key={entry.id} value={entry.id.toString()}>
                      <AccordionTrigger className="py-3 hover:no-underline">
                        <div className="flex flex-col items-start">
                          <div className="font-medium">{entry.type}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {entry.date}
                            <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block"></span>
                            {entry.provider}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2 pb-4 px-1">
                          <p className="text-sm">{entry.notes}</p>
                          <Button variant="link" size="sm" className="px-0 mt-2">
                            View full entry
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View all history
                </Button>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">CareCoins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg bg-health-50 p-4 flex items-center justify-between">
                    <div className="text-sm text-health-800">
                      Complete this chart to earn
                    </div>
                    <div className="text-lg font-medium text-health-800">
                      +25 coins
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    CareCoins are awarded for quality documentation and comprehensive patient care.
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    View your wallet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Charting;
