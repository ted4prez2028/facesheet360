
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  Download, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  Search, 
  SortAsc,
  Loader2 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePatients, PatientType } from "@/hooks/usePatients";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    condition: "",
    status: "Active" as const,
    assignedDoctor: ""
  });
  
  // Get MongoDB patients data
  const { 
    patients, 
    isLoading, 
    createPatient, 
    isCreating 
  } = usePatients(
    currentTab !== "all" ? { status: currentTab.charAt(0).toUpperCase() + currentTab.slice(1) } : {}
  );
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };
  
  const filteredPatients = patients.filter(
    patient => 
      patient.name.toLowerCase().includes(searchTerm) || 
      patient._id.toLowerCase().includes(searchTerm) ||
      patient.condition.toLowerCase().includes(searchTerm)
  );
  
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
  
  const handleAddPatient = () => {
    const today = new Date().toISOString().split('T')[0];
    
    createPatient({
      ...newPatient,
      age: parseInt(newPatient.age),
      lastVisit: today,
    });
    
    setShowAddPatientDialog(false);
    setNewPatient({
      name: "",
      age: "",
      gender: "Male",
      phone: "",
      condition: "",
      status: "Active",
      assignedDoctor: ""
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPatient(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setNewPatient(prev => ({ ...prev, [name]: value }));
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage your patients and their medical records
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patients..."
                className="pl-8 bg-background w-full"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-2 items-center">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>By Status</DropdownMenuItem>
                <DropdownMenuItem>By Condition</DropdownMenuItem>
                <DropdownMenuItem>By Doctor</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-2 items-center">
                  <SortAsc className="h-4 w-4" />
                  <span>Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
                <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
                <DropdownMenuItem>Recent Visit</DropdownMenuItem>
                <DropdownMenuItem>Oldest Visit</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" className="flex gap-2 items-center">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            
            <Button 
              className="flex gap-2 items-center bg-health-600 hover:bg-health-700"
              onClick={() => setShowAddPatientDialog(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Add Patient</span>
            </Button>
          </div>
        </div>
        
        <Tabs 
          defaultValue="all" 
          className="w-full"
          onValueChange={(value) => setCurrentTab(value)}
        >
          <TabsList>
            <TabsTrigger value="all">All Patients</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="stable">Stable</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
          </TabsList>
          
          <TabsContent value={currentTab} className="mt-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle>Patient List</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-health-600" />
                  </div>
                ) : (
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-sm">ID</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Age/Gender</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Phone</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Condition</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Last Visit</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Doctor</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPatients.map((patient) => (
                          <tr 
                            key={patient._id} 
                            className="border-b hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-4 text-sm">
                              {patient._id.substring(0, 8)}
                            </td>
                            <td className="py-3 px-4 font-medium">
                              {patient.name}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {patient.age} / {patient.gender}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {patient.phone}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {patient.condition}
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                variant="outline" 
                                className={getStatusColor(patient.status)}
                              >
                                {patient.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {formatDate(patient.lastVisit)}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {patient.assignedDoctor}
                            </td>
                            <td className="py-3 px-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                                  <DropdownMenuItem>View Chart</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                  <DropdownMenuItem>Create Note</DropdownMenuItem>
                                  <DropdownMenuItem>Schedule Appointment</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {!isLoading && filteredPatients.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    No patients found matching your search criteria.
                  </div>
                )}
                
                {!isLoading && filteredPatients.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredPatients.length} of {patients.length} patients
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" disabled>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" className="px-3 bg-primary text-primary-foreground hover:bg-primary/90">
                        1
                      </Button>
                      <Button variant="outline" size="sm" className="px-3">
                        2
                      </Button>
                      <Button variant="outline" size="sm" className="px-3">
                        3
                      </Button>
                      <Button variant="outline" size="sm">
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add Patient Dialog */}
      <Dialog open={showAddPatientDialog} onOpenChange={setShowAddPatientDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={newPatient.name} 
                  onChange={handleInputChange} 
                  placeholder="John Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  name="age"
                  type="number" 
                  value={newPatient.age} 
                  onChange={handleInputChange} 
                  min="0"
                  placeholder="45"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  defaultValue={newPatient.gender} 
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  value={newPatient.phone} 
                  onChange={handleInputChange} 
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="condition">Medical Condition</Label>
              <Input 
                id="condition" 
                name="condition"
                value={newPatient.condition} 
                onChange={handleInputChange} 
                placeholder="Hypertension"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  defaultValue={newPatient.status} 
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Stable">Stable</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedDoctor">Assigned Doctor</Label>
                <Input 
                  id="assignedDoctor" 
                  name="assignedDoctor"
                  value={newPatient.assignedDoctor} 
                  onChange={handleInputChange} 
                  placeholder="Dr. Jane Wilson"
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPatientDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddPatient} 
              className="bg-health-600 hover:bg-health-700"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Patient"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Patients;
