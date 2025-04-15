
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';

interface MedicalProfessionalsListProps {
  onViewProfile?: (professionalId: string) => void;
  onClearPrimaryPhysician?: () => void;
}

const MedicalProfessionalsList: React.FC<MedicalProfessionalsListProps> = ({ 
  onViewProfile,
  onClearPrimaryPhysician
}) => {
  // Mock medical professionals data based on the screenshot
  const professionals = [
    {
      id: '1',
      firstName: 'Kimemia',
      surname: 'Bernadette',
      profession: 'Nurse Practitioner',
      relation: null,
      phone: null
    },
    {
      id: '2',
      firstName: 'Shannon',
      surname: 'Hillier',
      profession: 'Optometrist',
      relation: null,
      phone: '(402) 999-8557'
    },
    {
      id: '3',
      firstName: 'Destiny',
      surname: 'Lett',
      profession: 'Nurse Practitioner',
      relation: null,
      phone: '(253) 922-4027'
    },
    {
      id: '4',
      firstName: 'Jefferson',
      surname: 'Loa',
      profession: 'Medical Director',
      relation: 'Primary',
      phone: '(253) 922-4027'
    },
    {
      id: '5',
      firstName: 'Patricia',
      surname: 'Medina',
      profession: 'Nurse Practitioner',
      relation: null,
      phone: '(253) 922-4027'
    },
    {
      id: '6',
      firstName: 'Adenike',
      surname: 'Oké',
      profession: 'Nurse Practitioner',
      relation: null,
      phone: '(253) 922-4027'
    },
    {
      id: '7',
      firstName: 'Tory',
      surname: 'Thornton',
      profession: 'Nurse Practitioner',
      relation: null,
      phone: '(541) 961-9734'
    },
    {
      id: '8',
      firstName: 'Mi',
      surname: 'Tran',
      profession: 'Nurse Practitioner',
      relation: null,
      phone: '(253) 922-4027'
    }
  ];

  const handleViewProfile = (id: string) => {
    if (onViewProfile) {
      onViewProfile(id);
    } else {
      console.log('View profile:', id);
    }
  };

  const handleClearPrimaryPhysician = () => {
    if (onClearPrimaryPhysician) {
      onClearPrimaryPhysician();
    } else {
      console.log('Clear primary physician');
    }
  };

  return (
    <>
      <Table className="border">
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="w-[100px]"></TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Surname</TableHead>
            <TableHead>Profession</TableHead>
            <TableHead>Relation</TableHead>
            <TableHead>Office Phone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {professionals.map((professional) => (
            <TableRow key={professional.id} className={professional.relation === 'Primary' ? 'bg-blue-50' : undefined}>
              <TableCell className="py-2">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="h-6 p-0 text-blue-600"
                  onClick={() => handleViewProfile(professional.id)}
                >
                  view profile
                </Button>
              </TableCell>
              <TableCell>{professional.firstName}</TableCell>
              <TableCell>{professional.surname}</TableCell>
              <TableCell>{professional.profession}</TableCell>
              <TableCell>{professional.relation}</TableCell>
              <TableCell>{professional.phone}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="text-sm mt-2 flex items-center">
        <span className="font-medium">Note: Primary Physician in bold</span>
        <Button 
          variant="link" 
          size="sm" 
          className="text-blue-600 ml-4"
          onClick={handleClearPrimaryPhysician}
        >
          Clear Primary Physician
        </Button>
      </div>
    </>
  );
};

export default MedicalProfessionalsList;
