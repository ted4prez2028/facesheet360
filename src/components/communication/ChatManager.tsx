import React, { useState } from 'react';
import ChatWindow from './ChatWindow';

interface ChatSession {
  id: string;
  contactId: string;
  contactName: string;
}

interface ChatManagerProps {
  children: (openChat: (contactId: string, contactName: string) => void) => React.ReactNode;
}

const ChatManager: React.FC<ChatManagerProps> = ({ children }) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  const openChat = (contactId: string, contactName: string) => {
    // Check if chat is already open
    const existingChat = chatSessions.find(chat => chat.contactId === contactId);
    if (existingChat) return;

    // Create new chat session
    const newChat: ChatSession = {
      id: `chat-${contactId}-${Date.now()}`,
      contactId,
      contactName
    };

    setChatSessions(prev => [...prev, newChat]);
  };

  const closeChat = (chatId: string) => {
    setChatSessions(prev => prev.filter(chat => chat.id !== chatId));
  };

  const handleStartCall = (contactId: string, contactName: string) => {
    console.log('Starting call with:', contactId, contactName);
    // TODO: Implement call functionality
  };

  const handleStartVideoCall = (contactId: string, contactName: string) => {
    console.log('Starting video call with:', contactId, contactName);
    // TODO: Implement video call functionality
  };

  return (
    <>
      {children(openChat)}
      
      {/* Render active chat windows */}
      {chatSessions.map((chat, index) => (
        <div
          key={chat.id}
          style={{
            position: 'fixed',
            bottom: '1rem',
            right: `${140 + (index * 330)}px`, // Start further right to avoid overlap with floating button
            zIndex: 40
          }}
        >
          <ChatWindow
            contactId={chat.contactId}
            contactName={chat.contactName}
            onClose={() => closeChat(chat.id)}
            onStartCall={() => handleStartCall(chat.contactId, chat.contactName)}
            onStartVideoCall={() => handleStartVideoCall(chat.contactId, chat.contactName)}
          />
        </div>
      ))}
    </>
  );
};

export default ChatManager;