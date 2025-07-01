
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import PrescriptionCard from '@/components/pharmacy/PrescriptionCard';
import AdministerMedicationDialog from './AdministerMedicationDialog';
import { Prescription } from '@/types';

interface PrescriptionListProps {
  prescriptions: Prescription[];
  onAdminister?: (prescriptionId: string, data: { administeredAt: Date; notes?: string }) => void;
  onAddPrescription?: () => void;
  showAddButton?: boolean;
}

const PrescriptionList: React.FC<PrescriptionListProps> = ({
  prescriptions,
  onAdminister,
  onAddPrescription,
  showAddButton = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isAdministerDialogOpen, setIsAdministerDialogOpen] = useState(false);

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.medication_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdminister = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsAdministerDialogOpen(true);
  };

  const handleConfirmAdminister = async (data: { administeredAt: Date; notes?: string }) => {
    if (selectedPrescription && onAdminister) {
      await onAdminister(selectedPrescription.id, data);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prescriptions</CardTitle>
              <CardDescription>
                Manage and track medication prescriptions
              </CardDescription>
            </div>
            {showAddButton && onAddPrescription && (
              <Button onClick={onAddPrescription}>
                <Plus className="h-4 w-4 mr-2" />
                Add Prescription
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {filteredPrescriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No prescriptions found matching your search.' : 'No prescriptions available.'}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredPrescriptions.map((prescription) => (
                  <PrescriptionCard
                    key={prescription.id}
                    prescription={prescription}
                    onAdminister={() => handleAdminister(prescription)}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedPrescription && (
        <AdministerMedicationDialog
          prescription={selectedPrescription}
          open={isAdministerDialogOpen}
          onOpenChange={setIsAdministerDialogOpen}
          onAdminister={handleConfirmAdminister}
        />
      )}
    </>
  );
};

export default PrescriptionList;
