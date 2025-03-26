import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus, Scan, Search, MoreHorizontal } from "lucide-react";
import { AddPatientDrawer } from "@/components/patients/AddPatientDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { usePatients, useDeletePatient } from "@/hooks/usePatients";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import FaceIdentificationDialog from "@/components/facial-recognition/FaceIdentificationDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  AlertTriangle,
} from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

const Patients = () => {
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [isFaceIdDialogOpen, setIsFaceIdDialogOpen] = useState(false);
  
  const { data: patients = [], isLoading, error } = usePatients();
  const deletePatientMutation = useDeletePatient();
  const { isAuthenticated } = useAuth();

  const handleIdentifyPatient = (patientId: string) => {
    if (patientId) {
      navigate(`/patients/${patientId}`);
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      deletePatientMutation.mutate(id);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const searchStr = searchQuery.toLowerCase();
    return (
      patient.first_name?.toLowerCase().includes(searchStr) ||
      patient.last_name?.toLowerCase().includes(searchStr) ||
      (patient.email && patient.email.toLowerCase().includes(searchStr)) ||
      (patient.phone && patient.phone.toLowerCase().includes(searchStr)) ||
      (patient.medical_record_number &&
        patient.medical_record_number.toLowerCase().includes(searchStr))
    );
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Patients</h1>
          <p className="text-muted-foreground">
            Manage your patients and their information.
          </p>
        </div>
        
        {!isAuthenticated && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You need to be logged in to view and manage patients. Please log in with your credentials.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <Button
            onClick={() => setIsAddPatientOpen(true)}
            className="flex items-center gap-2"
            disabled={!isAuthenticated}
          >
            <UserPlus size={16} />
            <span>Add New Patient</span>
          </Button>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsFaceIdDialogOpen(true)}
              className="flex items-center gap-2"
              disabled={!isAuthenticated}
            >
              <Scan size={16} />
              <span>Identify by Face</span>
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error instanceof Error ? error.message : String(error)}</AlertDescription>
          </Alert>
        )}

        <Table>
          <TableCaption>A list of your patients.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden md:table-cell">MRN</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-[200px]" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-[150px]" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-[80px]" />
                      </TableCell>
                    </TableRow>
                  ))}
              </>
            ) : filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <Link to={`/patients/${patient.id}`}>
                      {patient.first_name} {patient.last_name}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {patient.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {patient.phone}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {patient.medical_record_number}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/patients/${patient.id}`)}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePatient(patient.id)}
                        >
                          Delete Patient
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-4 text-muted-foreground"
                >
                  No patients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>
                {filteredPatients.length} Patient(s)
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <AddPatientDrawer
        open={isAddPatientOpen}
        onOpenChange={setIsAddPatientOpen}
        onPatientAdded={() => {
          /* Refetch handled by React Query invalidation */
        }}
      />

      <FaceIdentificationDialog
        isOpen={isFaceIdDialogOpen}
        onClose={() => setIsFaceIdDialogOpen(false)}
        onIdentificationSuccess={handleIdentifyPatient}
      />
    </DashboardLayout>
  );
};

export default Patients;
