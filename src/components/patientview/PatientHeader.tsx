
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Edit, 
  Printer, 
  LinkIcon,
  FileText
} from 'lucide-react';
import { Patient } from '@/types';
import { Avatar } from '@/components/ui/avatar';

interface PatientHeaderProps {
  patient: Patient;
  calculateAge: (dateOfBirth: string) => number;
}

const PatientHeader: React.FC<PatientHeaderProps> = ({ patient, calculateAge }) => {
  return (
    <div className="border-b pb-4">
      <div className="flex justify-between items-start">
        <div className="flex">
          <Avatar className="h-16 w-16 rounded-sm mr-4">
            <div className="bg-gray-300 h-full w-full flex items-center justify-center text-2xl font-bold text-gray-700">
              {patient.first_name?.[0]}{patient.last_name?.[0]}
            </div>
          </Avatar>
          
          <div>
            <h1 className="text-2xl font-bold">
              {patient.first_name} {patient.last_name} ({patient.medical_record_number || '4812'})
            </h1>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-1">
              <div className="text-sm">
                <span className="font-medium">Status:</span> Current
              </div>
              <div className="text-sm">
                <span className="font-medium">Location:</span> Hall #1 6-C
              </div>
              <div className="text-sm">
                <span className="font-medium">Gender:</span> {patient.gender}
              </div>
              <div className="text-sm">
                <span className="font-medium">DOB:</span> {patient.date_of_birth} 
                <span className="ml-2 font-medium">Age:</span> {calculateAge(patient.date_of_birth)}
              </div>
              <div className="text-sm">
                <span className="font-medium">Physician:</span> Jefferson Loa
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-x-2 flex">
          <Button variant="outline" className="flex items-center gap-1" size="sm">
            <LinkIcon className="h-4 w-4" />
            <span>Care Profile</span>
          </Button>
          
          <Button variant="outline" className="flex items-center gap-1" size="sm">
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          
          <Button variant="outline" className="flex items-center gap-1" size="sm">
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
          
          <Button variant="outline" className="flex items-center gap-1" size="sm">
            <FileText className="h-4 w-4" />
            <span>PointClickCare Connect</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PatientHeader;
