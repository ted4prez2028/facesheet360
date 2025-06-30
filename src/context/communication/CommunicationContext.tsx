
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect } from "react";
import { User, Message, Call, ChatWindow, ContactsState } from "@/types";
import { useCommunicationState } from "./useCommunicationState";
import GroupCallModal from "@/components/communication/GroupCallModal";
import GroupVideoCall from "@/components/communication/GroupVideoCall";

interface CommunicationContextType {
  contacts: ContactsState;
  chatWindows: ChatWindow[];
  activeCall: Call | null;
  isCallActive: boolean;
  isCallIncoming: boolean;
  isGroupCall: boolean;
  isGroupCallModalOpen: boolean;
  selectedContacts: string[];
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: string[];
  toggleContacts: () => void;
  openChatWindow: (userId: string, userName: string) => void;
  closeChatWindow: (userId: string) => void;
  minimizeChatWindow: (userId: string) => void;
  sendMessage: (recipientId: string, content: string) => void;
  startCall: (userId: string, userName: string, isVideo: boolean) => void;
  startGroupCall: (isVideo: boolean) => void;
  joinGroupCall: (roomId: string, participantIds: string[], isVideo: boolean) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleAudio: (mute: boolean) => void;
  toggleVideo: (hide: boolean) => void;
  openGroupCallModal: () => void;
  closeGroupCallModal: () => void;
  toggleContactSelection: (contactId: string) => void;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(
  undefined
);



interface CommunicationProviderProps {
  children: React.ReactNode;
}

export const CommunicationProvider = ({ children }: CommunicationProviderProps) => {
  // Use our refactored hooks that contain the actual implementation
  const communicationState = useCommunicationState();
  
  // Listen for group call join events
  useEffect(() => {
    const handleJoinGroupCall = (event: CustomEvent) => {
      const { roomId, participants, isVideo } = event.detail;
      communicationState.joinGroupCall(roomId, participants, isVideo);
    };
    
    window.addEventListener('join-group-call-event', handleJoinGroupCall as EventListener);
    
    return () => {
      window.removeEventListener('join-group-call-event', handleJoinGroupCall as EventListener);
    };
  }, [communicationState]);

  return (
    <CommunicationContext.Provider value={communicationState}>
      {children}
      <GroupVideoCall />
      <GroupCallModal 
        open={communicationState.isGroupCallModalOpen} 
        onOpenChange={communicationState.closeGroupCallModal} 
      />
    </CommunicationContext.Provider>
  );
};

export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (!context) throw new Error('useCommunication must be used within a CommunicationProvider');
  return context;
};
