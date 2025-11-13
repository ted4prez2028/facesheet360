
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

export function useCommunicationState() {
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const { user } = useAuth();

  const toggleContacts = useCallback(() => {
    setIsContactsOpen(prev => !prev);
  }, []);

  // Simplified state for now
  return {
    contacts: {
      onlineUsers: [],
      isOpen: isContactsOpen
    },
    chatWindows: [],
    activeCall: null,
    isCallActive: false,
    isCallIncoming: false,
    isGroupCallModalOpen: false,
    selectedContacts: [],
    remoteStreams: new Map(),
    localStream: null,
    isGroupCall: false,
    participants: [],
    toggleContacts,
    openChatWindow: () => {},
    closeChatWindow: () => {},
    minimizeChatWindow: () => {},
    sendMessage: () => {},
    startCall: () => {},
    startGroupCall: () => {},
    joinGroupCall: () => {},
    acceptCall: () => {},
    rejectCall: () => {},
    endCall: () => {},
    toggleAudio: () => {},
    toggleVideo: () => {},
    openGroupCallModal: () => {},
    closeGroupCallModal: () => {},
    toggleContactSelection: () => {}
  };
}
