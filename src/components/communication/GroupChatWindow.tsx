// Temporarily disabled during backend migration - group conversations table doesn't exist
import React from 'react';

interface GroupChatWindowProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
  onMinimize?: () => void;
}

export const GroupChatWindow: React.FC<GroupChatWindowProps> = () => {
  return null;
};

export default GroupChatWindow;
