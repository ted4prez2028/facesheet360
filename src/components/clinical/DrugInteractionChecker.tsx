import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Plus, X, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Medication {
  id: string;
  name: string;
}

interface Interaction {
  severity: 'high' | 'moderate' | 'low';
  medications: string[];
  description: string;
  recommendation: string;
}

// Sample drug interaction database (in production, this would come from a medical API)
const KNOWN_INTERACTIONS: Interaction[] = [
  {
    severity: 'high',
    medications: ['warfarin', 'aspirin'],
    description: 'Increased risk of bleeding when warfarin is combined with aspirin',
    recommendation: 'Monitor INR levels closely. Consider alternative pain management.'
  },
  {
    severity: 'moderate',
    medications: ['metformin', 'alcohol'],
    description: 'May increase risk of lactic acidosis',
    recommendation: 'Limit alcohol consumption while taking metformin.'
  },
  {
    severity: 'moderate',
    medications: ['lisinopril', 'potassium'],
    description: 'May cause hyperkalemia (high potassium levels)',
    recommendation: 'Monitor potassium levels regularly.'
  }
];

export function DrugInteractionChecker() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMed, setNewMed] = useState('');
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [checking, setChecking] = useState(false);

  const addMedication = () => {
    if (!newMed.trim()) return;
    
    const medication: Medication = {
      id: Date.now().toString(),
      name: newMed.trim().toLowerCase()
    };
    
    setMedications([...medications, medication]);
    setNewMed('');
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
    setInteractions([]);
  };

  const checkInteractions = async () => {
    if (medications.length < 2) {
      toast.error('Please add at least 2 medications to check for interactions');
      return;
    }

    setChecking(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const found: Interaction[] = [];
    const medNames = medications.map(m => m.name);

    // Check for known interactions
    KNOWN_INTERACTIONS.forEach((interaction) => {
      const allMedsPresent = interaction.medications.every((med: string) =>
        medNames.some(name => name.includes(med) || med.includes(name))
      );
      
      if (allMedsPresent) {
        found.push(interaction);
      }
    });

    setInteractions(found);
    setChecking(false);

    if (found.length === 0) {
      toast.success('No known interactions found');
    } else {
      toast.warning(`Found ${found.length} potential interaction(s)`);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'moderate':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Medications</CardTitle>
          <CardDescription>
            Enter medications to check for potential interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Enter medication name..."
                value={newMed}
                onChange={(e) => setNewMed(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMedication()}
              />
            </div>
            <Button onClick={addMedication}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-2 mb-4">
            {medications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No medications added yet
              </p>
            ) : (
              medications.map((med) => (
                <div
                  key={med.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <span className="font-medium capitalize">{med.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMedication(med.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <Button
            className="w-full"
            onClick={checkInteractions}
            disabled={medications.length < 2 || checking}
          >
            <Search className="h-4 w-4 mr-2" />
            {checking ? 'Checking...' : 'Check for Interactions'}
          </Button>
        </CardContent>
      </Card>

      {interactions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <CardTitle>Potential Interactions Found</CardTitle>
            </div>
            <CardDescription>
              {interactions.length} interaction(s) detected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {interactions.map((interaction, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getSeverityColor(interaction.severity)}>
                            {interaction.severity.toUpperCase()} Severity
                          </Badge>
                        </div>
                        <p className="font-medium capitalize">
                          {interaction.medications.join(' + ')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Description</Label>
                        <p className="text-sm text-muted-foreground">
                          {interaction.description}
                        </p>
                      </div>

                      <div>
                        <Label className="text-xs">Recommendation</Label>
                        <p className="text-sm text-muted-foreground">
                          {interaction.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
