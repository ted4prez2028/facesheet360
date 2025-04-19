
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCommunication } from '@/context/communication/CommunicationContext';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Video, Phone } from 'lucide-react';

interface GroupCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GroupCallModal: React.FC<GroupCallModalProps> = ({ open, onOpenChange }) => {
  const { 
    contacts,
    selectedContacts,
    toggleContactSelection,
    startGroupCall
  } = useCommunication();
  
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  
  // Filter contacts to only show those from the same organization
  const organizationContacts = contacts.onlineUsers.filter(
    contact => contact.online_status
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a Group Call</DialogTitle>
          <DialogDescription>
            Select contacts to add to your group call
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[300px] overflow-y-auto py-2">
          {organizationContacts.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No online contacts available
            </p>
          ) : (
            <div className="space-y-2">
              {organizationContacts.map((contact) => (
                <div 
                  key={contact.id}
                  className="flex items-center space-x-3 p-2 rounded-md border hover:bg-accent/50"
                >
                  <Checkbox 
                    id={`contact-${contact.id}`}
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={() => toggleContactSelection(contact.id)}
                  />
                  <Label 
                    htmlFor={`contact-${contact.id}`}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={contact.profile_image} />
                      <AvatarFallback>
                        {contact.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.role}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-center gap-4 py-2">
          <Button
            variant={callType === 'video' ? "default" : "outline"}
            className="flex gap-2"
            onClick={() => setCallType('video')}
          >
            <Video className="h-4 w-4" />
            Video Call
          </Button>
          <Button
            variant={callType === 'audio' ? "default" : "outline"}
            className="flex gap-2"
            onClick={() => setCallType('audio')}
          >
            <Phone className="h-4 w-4" />
            Audio Call
          </Button>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => startGroupCall(callType === 'video')}
            disabled={selectedContacts.length === 0}
          >
            Start Call ({selectedContacts.length} selected)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupCallModal;
