
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { usePatientNotes } from '@/hooks/usePatientNotes';

interface PatientNotesForCarePlanProps {
  patientId: string;
  onSelectNotes?: (selectedNotes: string[]) => void;
}

export function PatientNotesForCarePlan({ patientId, onSelectNotes }: PatientNotesForCarePlanProps) {
  const { notes, isLoading } = usePatientNotes(patientId);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  const handleToggleNote = (noteId: string) => {
    setSelectedNoteIds(prev => {
      const newSelection = prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId];
      
      if (onSelectNotes) {
        const selectedNotesContent = notes
          ?.filter(note => newSelection.includes(note.id))
          .map(note => note.content) || [];
        onSelectNotes(selectedNotesContent);
      }
      
      return newSelection;
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-2 animate-pulse">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-16 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No notes available for this patient
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="flex items-start space-x-2">
                <Checkbox 
                  id={`note-${note.id}`} 
                  checked={selectedNoteIds.includes(note.id)}
                  onCheckedChange={() => handleToggleNote(note.id)}
                />
                <div className="flex-1">
                  <Label 
                    htmlFor={`note-${note.id}`}
                    className="font-medium cursor-pointer flex items-center gap-2"
                  >
                    <span>{note.type}</span>
                    <span className="text-sm text-muted-foreground">
                      ({format(new Date(note.date), 'MMM dd, yyyy')})
                    </span>
                  </Label>
                  <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                    {note.content.length > 200 
                      ? `${note.content.substring(0, 200)}...` 
                      : note.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default PatientNotesForCarePlan;
