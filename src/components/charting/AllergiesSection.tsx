import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAllergies } from '@/hooks/useAllergies';

interface AllergiesSectionProps {
  patientId: string | null;
}

const AllergiesSection: React.FC<AllergiesSectionProps> = ({ patientId }) => {
  const { allergies, isLoading } = useAllergies(patientId || '');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allergies</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground">Loading...</div>
        ) : allergies.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">No recorded allergies</div>
        ) : (
          <ul className="space-y-2">
            {allergies.map((allergy) => (
              <li key={allergy.id} className="flex items-center justify-between p-2 border rounded">
                <span>{allergy.allergen}</span>
                <Badge variant="outline">{allergy.severity}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default AllergiesSection;
