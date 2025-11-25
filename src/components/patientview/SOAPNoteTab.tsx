import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Save, FileText } from 'lucide-react';
import { usePatientNotes } from '@/hooks/usePatientNotes';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { format } from 'date-fns';

interface SOAPNoteTabProps {
  patientId: string;
}

export const SOAPNoteTab = ({ patientId }: SOAPNoteTabProps) => {
  const { user } = useAuth();
  const { notes, addNote, isLoading } = usePatientNotes(patientId);
  const { logEvent } = useAuditLog();
  const [isCreating, setIsCreating] = useState(false);
  
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');

  const soapNotes = notes?.filter(note => note.type === 'soap') || [];

  const handleSaveNote = async () => {
    if (!user) return;
    
    if (!subjective.trim() && !objective.trim() && !assessment.trim() && !plan.trim()) {
      toast.error('Please fill in at least one section');
      return;
    }

    try {
      await addNote.mutateAsync({
        patientId,
        providerId: user.id,
        content: JSON.stringify({ subjective, objective, assessment, plan }),
        noteType: 'General'
      });

      // Log audit event
      await logEvent('chart_access', patientId, undefined, {
        action: 'soap_note_created',
        note_sections: { subjective: !!subjective, objective: !!objective, assessment: !!assessment, plan: !!plan }
      });

      // Reset form
      setSubjective('');
      setObjective('');
      setAssessment('');
      setPlan('');
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving SOAP note:', error);
    }
  };

  const parseSOAPContent = (content: string) => {
    try {
      return JSON.parse(content);
    } catch {
      return { subjective: content, objective: '', assessment: '', plan: '' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">SOAP Notes</h2>
        <Button onClick={() => setIsCreating(!isCreating)} variant="default">
          <Plus className="h-4 w-4 mr-2" />
          New SOAP Note
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create SOAP Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subjective">Subjective (Patient's complaints, symptoms)</Label>
              <Textarea
                id="subjective"
                placeholder="What the patient tells you... chief complaint, history of present illness, review of systems"
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective">Objective (Observable findings)</Label>
              <Textarea
                id="objective"
                placeholder="Vital signs, physical exam findings, lab results, imaging results"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessment">Assessment (Diagnosis/evaluation)</Label>
              <Textarea
                id="assessment"
                placeholder="Your clinical impression, differential diagnoses, problem list"
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Plan (Treatment plan)</Label>
              <Textarea
                id="plan"
                placeholder="Medications, procedures, follow-up, patient education, referrals"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveNote} disabled={addNote.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Save SOAP Note
              </Button>
              <Button onClick={() => setIsCreating(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading notes...
            </CardContent>
          </Card>
        ) : soapNotes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No SOAP notes yet. Create your first note above.</p>
            </CardContent>
          </Card>
        ) : (
          soapNotes.map((note) => {
            const content = parseSOAPContent(note.content);
            return (
              <Card key={note.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      SOAP Note - {format(new Date(note.date), 'MMM dd, yyyy h:mm a')}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      By: {note.provider}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {content.subjective && (
                    <div>
                      <h4 className="font-semibold text-sm text-primary mb-1">Subjective</h4>
                      <p className="text-sm whitespace-pre-wrap">{content.subjective}</p>
                    </div>
                  )}
                  {content.objective && (
                    <div>
                      <h4 className="font-semibold text-sm text-primary mb-1">Objective</h4>
                      <p className="text-sm whitespace-pre-wrap">{content.objective}</p>
                    </div>
                  )}
                  {content.assessment && (
                    <div>
                      <h4 className="font-semibold text-sm text-primary mb-1">Assessment</h4>
                      <p className="text-sm whitespace-pre-wrap">{content.assessment}</p>
                    </div>
                  )}
                  {content.plan && (
                    <div>
                      <h4 className="font-semibold text-sm text-primary mb-1">Plan</h4>
                      <p className="text-sm whitespace-pre-wrap">{content.plan}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
