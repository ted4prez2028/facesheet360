
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Video, Phone, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useCommunication } from '@/context/communication/CommunicationContext';
import { usePeerConnection } from '@/hooks/usePeerConnection';

interface GroupCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GroupCallModal: React.FC<GroupCallModalProps> = ({ open, onOpenChange }) => {
  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toggleContactSelection, selectedContacts, startGroupCall } = useCommunication();
  const { getOrganizationUsers } = usePeerConnection();
  
  // Fetch organization users when modal opens
  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        setIsLoading(true);
        const users = await getOrganizationUsers();
        setOrganizationUsers(users);
        setIsLoading(false);
      };
      fetchUsers();
    }
  }, [open, getOrganizationUsers]);
  
  // Start video group call
  const handleStartVideoCall = () => {
    startGroupCall(true);
  };
  
  // Start audio-only group call
  const handleStartAudioCall = () => {
    startGroupCall(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a Group Call</DialogTitle>
          <DialogDescription>
            Select team members from your organization to start a group call.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="text-sm font-medium mb-3">Organization Members</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-health-600"></div>
            </div>
          ) : organizationUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No organization members available</p>
              <p className="text-xs mt-1">Make sure your organization is set in your profile</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {organizationUsers.map(user => (
                <div key={user.id} className="flex items-center space-x-3 p-2 rounded hover:bg-muted">
                  <Checkbox
                    id={`check-${user.id}`}
                    checked={selectedContacts.includes(user.id)}
                    onCheckedChange={() => toggleContactSelection(user.id)}
                  />
                  <div className="flex items-center w-full space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profile_image} />
                      <AvatarFallback className="bg-health-600 text-white">
                        {user.name?.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                    </div>
                    <div className="ml-auto">
                      {user.online_status ? (
                        <span className="flex h-2 w-2 bg-green-500 rounded-full" title="Online" />
                      ) : (
                        <span className="flex h-2 w-2 bg-gray-300 rounded-full" title="Offline" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="mt-2 sm:mt-0"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleStartAudioCall}
              disabled={isLoading || selectedContacts.length === 0}
            >
              <Phone className="mr-2 h-4 w-4" />
              Audio Call
            </Button>
            <Button 
              onClick={handleStartVideoCall}
              disabled={isLoading || selectedContacts.length === 0}
            >
              <Video className="mr-2 h-4 w-4" />
              Video Call
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupCallModal;
