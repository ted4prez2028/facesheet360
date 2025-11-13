// Temporarily disabled during backend migration - group conversations table doesn't exist
import React from 'react';

interface CreateGroupChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (groupId: string, groupName: string) => void;
}

export const CreateGroupChatDialog: React.FC<CreateGroupChatDialogProps> = () => {
  return null;
};

export default CreateGroupChatDialog;
