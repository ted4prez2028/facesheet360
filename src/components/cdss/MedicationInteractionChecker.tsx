import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Search, X } from 'lucide-react';

export function MedicationInteractionChecker() {
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: interactions = [] } = useQuery({
    queryKey: ['medication-interactions', selectedMeds],
    queryFn: async () => {
      if (selectedMeds.length < 2) return [];
      
      const { data, error } = await supabase
        .from('medication_interactions')
        .select('*')
        .or(
          selectedMeds.flatMap((med1, i) =>
            selectedMeds.slice(i + 1).map(med2 =>
              `and(medication_1.eq.${med1},medication_2.eq.${med2}),and(medication_1.eq.${med2},medication_2.eq.${med1})`
            )
          ).join(',')
        );
      
      if (error) throw error;
      return data;
    },
    enabled: selectedMeds.length >= 2,
  });

  const addMedication = () => {
    if (searchTerm && !selectedMeds.includes(searchTerm)) {
      setSelectedMeds([...selectedMeds, searchTerm]);
      setSearchTerm('');
    }
  };

  const removeMedication = (med: string) => {
    setSelectedMeds(selectedMeds.filter(m => m !== med));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'contraindicated': return 'destructive';
      case 'severe': return 'destructive';
      case 'moderate': return 'default';
      case 'mild': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medication Interaction Checker</CardTitle>
        <CardDescription>Check for potential drug interactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add medications */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter medication name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addMedication()}
          />
          <Button onClick={addMedication}>
            <Search className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Selected medications */}
        {selectedMeds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedMeds.map(med => (
              <Badge key={med} variant="secondary" className="gap-1">
                {med}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeMedication(med)}
                />
              </Badge>
            ))}
          </div>
        )}

        {/* Interactions */}
        {interactions.length > 0 && (
          <div className="space-y-3 mt-4">
            <h3 className="font-semibold text-sm">Detected Interactions</h3>
            {interactions.map((interaction: any) => (
              <Alert key={interaction.id} variant={interaction.interaction_severity === 'contraindicated' || interaction.interaction_severity === 'severe' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getSeverityColor(interaction.interaction_severity)}>
                      {interaction.interaction_severity.toUpperCase()}
                    </Badge>
                    <span className="font-medium">
                      {interaction.medication_1} + {interaction.medication_2}
                    </span>
                  </div>
                  <p className="text-sm">{interaction.interaction_description}</p>
                  {interaction.clinical_guidance && (
                    <p className="text-sm mt-2 font-medium">
                      Guidance: {interaction.clinical_guidance}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {selectedMeds.length >= 2 && interactions.length === 0 && (
          <Alert>
            <AlertDescription className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              No interactions found between selected medications
            </AlertDescription>
          </Alert>
        )}

        {selectedMeds.length < 2 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Add at least 2 medications to check for interactions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}