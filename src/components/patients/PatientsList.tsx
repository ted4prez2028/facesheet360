
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableFooter, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { Patient } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface PatientsListProps {
  patients: Patient[];
  filteredPatients: Patient[];
  isLoading: boolean;
  error: Error | null;
  handleDeletePatient: (id: string) => void;
}

const PatientsList: React.FC<PatientsListProps> = ({ 
  patients, 
  filteredPatients, 
  isLoading, 
  error,
  handleDeletePatient 
}) => {
  const navigate = useNavigate();

  return (
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
              {error ? "Error loading patients." : "No patients found."}
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
  );
};

export default PatientsList;
