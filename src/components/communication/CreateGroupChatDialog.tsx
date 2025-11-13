import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useCommunication } from '@/hooks/useCommunication';

interface CreateGroupChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (groupId: string, groupName: string) => void;
}

const CreateGroupChatDialog: React.FC<CreateGroupChatDialogProps> = ({
  isOpen,
  onClose,
  onGroupCreated
}) => {
  const { user } = useAuth();
  const { users } = useCommunication();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('Please select at least one participant');
      return;
    }

    setCreating(true);
    try {
      // Create group conversation
      const { data: group, error: groupError } = await supabase
        .from('group_conversations')
        .insert({
          name: groupName,
          description: description || null,
          created_by: user?.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin
      const participants = [
        {
          group_id: group.id,
          user_id: user?.id,
          role: 'admin'
        },
        // Add selected users as members
        ...selectedUsers.map(userId => ({
          group_id: group.id,
          user_id: userId,
          role: 'member'
        }))
      ];

      const { error: participantsError } = await supabase
        .from('group_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      toast.success('Group chat created!');
      onGroupCreated(group.id, group.name);
      
      // Reset form
      setGroupName('');
      setDescription('');
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group chat');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Group Chat
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name *</Label>
            <Input
              id="groupName"
              placeholder="e.g., Care Team A"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Group purpose or description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Select Participants *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <ScrollArea className="h-64 rounded-md border">
              <div className="p-4 space-y-2">
                {filteredUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No providers found
                  </p>
                ) : (
                  filteredUsers.map(contact => (
                    <div
                      key={contact.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => toggleUserSelection(contact.id)}
                    >
                      <Checkbox
                        checked={selectedUsers.includes(contact.id)}
                        onCheckedChange={() => toggleUserSelection(contact.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={contact.name || 'User'} />
                        <AvatarFallback className="text-xs">
                          {contact.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{contact.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{contact.role}</p>
                      </div>
                      {contact.organization && (
                        <Badge variant="outline" className="text-xs">
                          {contact.organization}
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            
            {selectedUsers.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedUsers.length} participant{selectedUsers.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? 'Creating...' : 'Create Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupChatDialog;
