import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  PenTool, 
  MoreHorizontal, 
  FilePlus, 
  FileText 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  patientId: string;
  date: string;
  provider: string;
  type: string;
  content: string;
}

interface PatientNotesProps {
  patientId: string;
  userId: string | undefined;
}

const PatientNotes = ({ patientId, userId }: PatientNotesProps) => {
  const { toast } = useToast();
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("Progress Note");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: notes, isLoading: isLoadingNotes, refetch: refetchNotes } = useQuery({
    queryKey: ['patient-notes', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('chart_records')
        .select(`
          id,
          patient_id,
          provider_id,
          record_date,
          record_type,
          diagnosis,
          notes,
          users:provider_id (name)
        `)
        .eq('patient_id', patientId)
        .eq('record_type', 'note')
        .order('record_date', { ascending: false });
        
      if (error) throw error;
      
      return data.map(note => ({
        id: note.id,
        patientId: note.patient_id,
        date: note.record_date,
        provider: note.users?.name || 'Unknown Provider',
        type: note.diagnosis || 'Progress Note',
        content: note.notes || ''
      }));
    },
    enabled: !!patientId
  });

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) {
      toast({
        title: "Note cannot be empty",
        description: "Please enter content for your note",
        variant: "destructive",
      });
      return;
    }
    
    if (!patientId || !userId) {
      toast({
        title: "Error",
        description: "Patient or provider information is missing",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('chart_records')
        .insert({
          patient_id: patientId,
          provider_id: userId,
          record_type: 'note',
          record_date: new Date().toISOString(),
          diagnosis: noteType,
          notes: noteText
        })
        .select();
        
      if (error) throw error;
      
      setIsCreatingNote(false);
      setNoteText("");
      setNoteType("Progress Note");
      refetchNotes();
      
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error saving note",
        description: "An error occurred while saving your note",
        variant: "destructive",
      });
    }
  };
  
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="px-6 py-3 border-b flex items-center justify-between">
        <h3 className="font-medium">Patient Notes</h3>
        <Button 
          className="gap-2 bg-health-600 hover:bg-health-700"
          size="sm"
          onClick={() => setIsCreatingNote(true)}
        >
          <PenTool className="h-4 w-4" />
          <span>New Note</span>
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="px-6 py-2">
          {isCreatingNote && (
            <Card className="mb-4 border-health-200 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">New Note</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {noteType}
                        <MoreHorizontal className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setNoteType("Progress Note")}>
                        Progress Note
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setNoteType("Consultation")}>
                        Consultation
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setNoteType("Procedure Note")}>
                        Procedure Note
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setNoteType("Discharge Summary")}>
                        Discharge Summary
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  placeholder="Enter your note here..."
                  className="min-h-[120px]"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleFileUpload}
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    Attach File
                  </Button>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsCreatingNote(false);
                    setNoteText("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  className="bg-health-600 hover:bg-health-700"
                  onClick={handleSaveNote}
                >
                  Save Note
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {isLoadingNotes ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-16 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : notes && notes.length > 0 ? (
            notes.map((note) => (
              <Card key={note.id} className="mb-4">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{note.type}</CardTitle>
                      <CardDescription>
                        {formatDateTime(note.date)} by {note.provider}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Print</DropdownMenuItem>
                        <DropdownMenuItem>Share</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{note.content}</p>
                </CardContent>
              </Card>
            ))
          ) : !isCreatingNote && (
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p>No notes found for this patient</p>
              <p className="text-sm mt-1">Create a new note to get started</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );
};

export default PatientNotes;
