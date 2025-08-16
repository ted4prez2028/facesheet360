import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import VideoCallInterface from './VideoCallInterface';

interface ChatSession {
  id: string;
  contactId: string;
  contactName: string;
  minimized: boolean;
}

interface ChatManagerProps {
  children: (openChat: (contactId: string, contactName: string) => void) => React.ReactNode;
}

const ChatManager: React.FC<ChatManagerProps> = ({ children }) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  const openChat = (contactId: string, contactName: string) => {
    setChatSessions(prev => {
      const existing = prev.find(c => c.contactId === contactId);
      if (existing) {
        return prev.map(c => ({
          ...c,
          minimized: c.contactId !== contactId,
        }));
      }

      const newChat: ChatSession = {
        id: `chat-${contactId}-${Date.now()}`,
        contactId,
        contactName,
        minimized: false,
      };

      return prev.map(c => ({ ...c, minimized: true })).concat(newChat);
    });
  };

  const closeChat = (chatId: string) => {
    setChatSessions(prev => prev.filter(chat => chat.id !== chatId));
  };

  const minimizeChat = (chatId: string) => {
    setChatSessions(prev =>
      prev.map(chat => ({
        ...chat,
        minimized: chat.id === chatId ? true : chat.minimized,
      }))
    );
  };

  const activateChat = (chatId: string) => {
    setChatSessions(prev =>
      prev.map(chat => ({
        ...chat,
        minimized: chat.id !== chatId,
      }))
    );
  };

  const [activeVideoCall, setActiveVideoCall] = useState<{contactId: string, contactName: string} | null>(null);

  const handleStartCall = (contactId: string, contactName: string) => {
    // Start audio-only call
    setActiveVideoCall({ contactId, contactName });
  };

  const handleStartVideoCall = (contactId: string, contactName: string) => {
    // Start video call
    setActiveVideoCall({ contactId, contactName });
  };

  return (
    <>
      {children(openChat)}
      
      {/* Active chat window */}
      {chatSessions.filter(c => !c.minimized).map(chat => (
        <div
          key={chat.id}
          style={{
            position: 'fixed',
            bottom: '4rem',
            right: '1rem',
            zIndex: 40,
          }}
        >
          <ChatWindow
            contactId={chat.contactId}
            contactName={chat.contactName}
            onClose={() => closeChat(chat.id)}
            onMinimize={() => minimizeChat(chat.id)}
            onStartCall={() => handleStartCall(chat.contactId, chat.contactName)}
            onStartVideoCall={() => handleStartVideoCall(chat.contactId, chat.contactName)}
          />
        </div>
      ))}

      {/* Dock of minimized chats */}
      {chatSessions.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '0.5rem',
            left: '0.5rem',
            display: 'flex',
            gap: '0.5rem',
            zIndex: 40,
          }}
        >
          {chatSessions.map(chat => (
            <button
              key={chat.id}
              onClick={() => activateChat(chat.id)}
              style={{
                padding: '0.25rem 0.5rem',
                background: chat.minimized ? '#f3f4f6' : '#3b82f6',
                color: chat.minimized ? '#000' : '#fff',
                borderRadius: '0.25rem',
                minWidth: '6rem',
              }}
            >
              {chat.contactName}
            </button>
          ))}
        </div>
      )}
      
      {/* Video Call Interface */}
      {activeVideoCall && (
        <VideoCallInterface
          contactId={activeVideoCall.contactId}
          contactName={activeVideoCall.contactName}
          onClose={() => setActiveVideoCall(null)}
        />
      )}
    </>
  );
};

export default ChatManager;