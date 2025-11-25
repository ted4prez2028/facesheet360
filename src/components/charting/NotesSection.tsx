
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClinicalNote } from '@/types';

interface NotesSectionProps {
  patientId: string | null;
  providerId: string | undefined;
  notes: ClinicalNote[];
}

const NotesSection: React.FC<NotesSectionProps> = ({ patientId, providerId, notes }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clinical Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {notes && notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((note, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{note.title || 'Clinical Note'}</h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{note.content}</p>
                  {note.provider && (
                    <p className="text-xs text-muted-foreground mt-2">
                      By: {note.provider}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No clinical notes available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotesSection;
