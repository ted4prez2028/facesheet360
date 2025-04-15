
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
import { Patient } from '@/types';
import { Edit, Trash } from 'lucide-react';

interface ContactsListProps {
  patient: Patient;
  onEdit?: (contactId: string) => void;
  onDelete?: (contactId: string) => void;
}

const ContactsList: React.FC<ContactsListProps> = ({ patient, onEdit, onDelete }) => {
  // Mock contacts data based on the screenshot
  const contacts = [
    {
      id: '1',
      name: `Kimberly ${patient.last_name} (9632021)`,
      phone: '(702) 755-0684',
      phoneType: 'Home',
      relation: 'Mother',
      contactType: 'Emergency Contact # 2'
    },
    {
      id: '2',
      name: `Teddy ${patient.last_name} Murray (3264993)`,
      phone: '(413) 758-0473',
      phoneType: 'Mobile',
      relation: 'Self',
      contactType: 'Responsible Party'
    }
  ];

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id);
    } else {
      console.log('Edit contact:', id);
    }
  };

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    } else {
      console.log('Delete contact:', id);
    }
  };

  return (
    <>
      <Table className="border">
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="w-[80px]">Actions</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone/Email (listed in priority order)</TableHead>
            <TableHead>Relation</TableHead>
            <TableHead>Contact Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="py-2">
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(contact.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDelete(contact.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{contact.name}</TableCell>
              <TableCell>
                <div>
                  <span className="font-medium">{contact.phoneType}:</span> {contact.phone}
                </div>
              </TableCell>
              <TableCell>{contact.relation}</TableCell>
              <TableCell>{contact.contactType}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default ContactsList;
