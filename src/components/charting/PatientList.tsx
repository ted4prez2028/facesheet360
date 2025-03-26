import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, PlusCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Patient {
  id: string;
  name: string;
  age: number;
  status: string;
  lastVisit: string;
  imgUrl: string | null;
}

interface PatientListProps {
  selectedPatient: string | null;
  setSelectedPatient: (id: string) => void;
  setIsAddPatientOpen: (isOpen: boolean) => void;
  user: any;
}

const PatientList = ({ 
  selectedPatient, 
  setSelectedPatient, 
  setIsAddPatientOpen,
  user 
}: PatientListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
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
  );
};

export default PatientList;
