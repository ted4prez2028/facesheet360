
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Video, Phone } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  online: boolean;
}

interface GroupCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
}

const GroupCallModal: React.FC<GroupCallModalProps> = ({
  isOpen,
  onClose,
  contacts
}) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [callTitle, setCallTitle] = useState('');
  const [isVideoCall, setIsVideoCall] = useState(true);

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleStartCall = () => {
    if (selectedContacts.length === 0) return;

    // Mock call start - in real implementation, this would integrate with WebRTC
    console.log('Starting group call:', {
      participants: selectedContacts,
      title: callTitle,
      isVideo: isVideoCall
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start Group Call</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="call-title">Call Title (Optional)</Label>
            <Input
              id="call-title"
              placeholder="Team Meeting"
              value={callTitle}
              onChange={(e) => setCallTitle(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="video-call"
              checked={isVideoCall}
              onCheckedChange={(checked) => setIsVideoCall(checked as boolean)}
            />
            <Label htmlFor="video-call" className="flex items-center gap-2">
              {isVideoCall ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
              {isVideoCall ? 'Video Call' : 'Audio Only'}
            </Label>
          </div>

          <div>
            <Label>Select Participants</Label>
            <div className="max-h-48 overflow-y-auto space-y-2 mt-2">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`contact-${contact.id}`}
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={() => handleContactToggle(contact.id)}
                  />
                  <Label 
                    htmlFor={`contact-${contact.id}`} 
                    className="flex items-center gap-2 flex-1"
                  >
                    <div className={`w-2 h-2 rounded-full ${contact.online ? 'bg-green-500' : 'bg-gray-300'}`} />
                    {contact.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleStartCall}
              disabled={selectedContacts.length === 0}
              className="flex-1"
            >
              Start Call ({selectedContacts.length})
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupCallModal;
