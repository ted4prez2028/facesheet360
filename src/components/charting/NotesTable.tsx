
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Note {
  id: string;
  content: string;
  created_at: string;
  author?: string;
  note_type?: string;
}

interface NotesTableProps {
  notes?: Note[];
}

export const NotesTable: React.FC<NotesTableProps> = ({ notes = [] }) => {
  if (!notes || notes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">No notes recorded for this patient.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((note) => (
              <TableRow key={note.id}>
                <TableCell>{note.created_at}</TableCell>
                <TableCell>{note.note_type || 'General'}</TableCell>
                <TableCell>{note.author || 'Unknown'}</TableCell>
                <TableCell>
                  <ScrollArea className="h-24 w-full rounded-md border p-2">
                    {note.content}
                  </ScrollArea>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
