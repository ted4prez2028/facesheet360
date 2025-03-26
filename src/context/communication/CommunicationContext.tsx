
import React, { createContext, useContext } from "react";
import { User, Message, Call, ChatWindow, ContactsState } from "@/types";
import { useCommunicationState } from "./useCommunicationState";

interface CommunicationContextType {
  contacts: ContactsState;
  chatWindows: ChatWindow[];
  activeCall: Call | null;
  isCallActive: boolean;
  isCallIncoming: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  toggleContacts: () => void;
  openChatWindow: (userId: string, userName: string) => void;
  closeChatWindow: (userId: string) => void;
  minimizeChatWindow: (userId: string) => void;
  sendMessage: (recipientId: string, content: string) => void;
  startCall: (userId: string, userName: string, isVideo: boolean) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleAudio: (mute: boolean) => void;
  toggleVideo: (hide: boolean) => void;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(
  undefined
);

export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (!context) {
    throw new Error(
      "useCommunication must be used within a CommunicationProvider"
    );
  }
  return context;
};

interface CommunicationProviderProps {
  children: React.ReactNode;
}

export const CommunicationProvider = ({ children }: CommunicationProviderProps) => {
  // Use our refactored hooks that contain the actual implementation
  const communicationState = useCommunicationState();

  return (
    <CommunicationContext.Provider value={communicationState}>
      {children}
    </CommunicationContext.Provider>
  );
};
