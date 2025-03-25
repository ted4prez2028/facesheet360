
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
  SortAsc 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock patient data
const patientsData = [
  { 
    id: "P001", 
    name: "John Smith", 
    age: 45, 
    gender: "Male", 
    phone: "(555) 123-4567", 
    condition: "Hypertension", 
    status: "Active", 
    lastVisit: "2023-06-15",
    assignedDoctor: "Dr. Jane Wilson"
  },
  { 
    id: "P002", 
    name: "Maria Rodriguez", 
    age: 32, 
    gender: "Female", 
    phone: "(555) 987-6543", 
    condition: "Pregnancy", 
    status: "Active", 
    lastVisit: "2023-06-20",
    assignedDoctor: "Dr. Jane Wilson"
  },
  { 
    id: "P003", 
    name: "Robert Johnson", 
    age: 67, 
    gender: "Male", 
    phone: "(555) 456-7890", 
    condition: "Diabetes Type 2", 
    status: "Critical", 
    lastVisit: "2023-06-22",
    assignedDoctor: "Dr. Michael Chen"
  },
  { 
    id: "P004", 
    name: "Emily Davis", 
    age: 28, 
    gender: "Female", 
    phone: "(555) 789-0123", 
    condition: "Migraine", 
    status: "Stable", 
    lastVisit: "2023-06-18",
    assignedDoctor: "Dr. Jane Wilson"
  },
  { 
    id: "P005", 
    name: "William Brown", 
    age: 52, 
    gender: "Male", 
    phone: "(555) 234-5678", 
    condition: "Arthritis", 
    status: "Active", 
    lastVisit: "2023-06-10",
    assignedDoctor: "Dr. Sarah Lee"
  },
  { 
    id: "P006", 
    name: "Jennifer Lee", 
    age: 41, 
    gender: "Female", 
    phone: "(555) 345-6789", 
    condition: "Asthma", 
    status: "Stable", 
    lastVisit: "2023-06-05",
    assignedDoctor: "Dr. Michael Chen"
  },
  { 
    id: "P007", 
    name: "Michael Wilson", 
    age: 35, 
    gender: "Male", 
    phone: "(555) 567-8901", 
    condition: "Anxiety", 
    status: "Active", 
    lastVisit: "2023-06-12",
    assignedDoctor: "Dr. Sarah Lee"
  },
  { 
    id: "P008", 
    name: "Samantha Taylor", 
    age: 29, 
    gender: "Female", 
    phone: "(555) 678-9012", 
    condition: "Depression", 
    status: "Active", 
    lastVisit: "2023-06-14",
    assignedDoctor: "Dr. Jane Wilson"
  }
];

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState(patientsData);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.trim() === "") {
      setFilteredPatients(patientsData);
    } else {
      const filtered = patientsData.filter(
        patient => 
          patient.name.toLowerCase().includes(term) || 
          patient.id.toLowerCase().includes(term) ||
          patient.condition.toLowerCase().includes(term)
      );
      setFilteredPatients(filtered);
    }
  };
  
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
            
            <Button className="flex gap-2 items-center bg-health-600 hover:bg-health-700">
              <Plus className="h-4 w-4" />
              <span>Add Patient</span>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Patients</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="stable">Stable</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle>Patient List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto mt-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          ID
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Age/Gender
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Phone
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Condition
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Last Visit
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Doctor
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((patient) => (
                        <tr 
                          key={patient.id} 
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm">
                            {patient.id}
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
                
                {filteredPatients.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    No patients found matching your search criteria.
                  </div>
                )}
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredPatients.length} of {patientsData.length} patients
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="active" className="mt-6">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center py-10 text-muted-foreground">
                  Filter view for Active patients
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stable" className="mt-6">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center py-10 text-muted-foreground">
                  Filter view for Stable patients
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="critical" className="mt-6">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center py-10 text-muted-foreground">
                  Filter view for Critical patients
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Patients;
