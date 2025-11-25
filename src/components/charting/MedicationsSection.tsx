
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MedicationRecord } from '@/types';

interface MedicationsSectionProps {
  patientId: string | null;
  medications: MedicationRecord[];
}

const MedicationsSection: React.FC<MedicationsSectionProps> = ({ patientId, medications }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Medications</CardTitle>
        </CardHeader>
        <CardContent>
          {medications && medications.length > 0 ? (
            <div className="space-y-4">
              {medications.map((medication, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{medication.medication_name}</h4>
                    <Badge variant={medication.status === 'prescribed' ? 'secondary' : 'default'}>
                      {medication.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Dosage</p>
                      <p className="text-muted-foreground">{medication.dosage}</p>
                    </div>
                    <div>
                      <p className="font-medium">Frequency</p>
                      <p className="text-muted-foreground">{medication.frequency}</p>
                    </div>
                  </div>
                  {medication.instructions && (
                    <div className="mt-2">
                      <p className="font-medium text-sm">Instructions</p>
                      <p className="text-sm text-muted-foreground">{medication.instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No medications recorded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicationsSection;
