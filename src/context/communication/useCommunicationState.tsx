
import { useState, useCallback } from "react";
import { useAuth } from "../AuthContext";
import { useCommunicationService } from "@/hooks/useCommunicationService";
import { usePeerConnection } from "@/hooks/usePeerConnection";
import { toast } from "sonner";

export function useCommunicationState() {
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const { user } = useAuth();
  
  // Use our communication service hook
  const communicationService = useCommunicationService();
  
  // Use our peer connection hook for WebRTC
  const peerConnection = usePeerConnection();

  const toggleContacts = useCallback(() => {
    setIsContactsOpen(prev => !prev);
  }, []);

  // Start a call - initialize both WebRTC and update database
  const startCall = useCallback((userId: string, userName: string, isVideo: boolean) => {
    if (!user) {
      toast.error("You must be logged in to start a call.");
      return;
    }

    // Start the database call tracking
    communicationService.startCall(userId, userName, isVideo);
    
    // Initialize WebRTC connection
    peerConnection.startCall(userId, isVideo);
  }, [user, communicationService, peerConnection]);

  // Accept an incoming call
  const acceptCall = useCallback(() => {
    if (!communicationService.activeCall) return;
    
    communicationService.acceptCall();
    
    // For WebRTC, the peer connection is already set up when answering
    // from the peer event handler, so we don't need to do anything here
  }, [communicationService]);

  // Reject an incoming call
  const rejectCall = useCallback(() => {
    if (!communicationService.activeCall) return;
    
    communicationService.endCall();
  }, [communicationService]);

  // End an ongoing call
  const endCall = useCallback(() => {
    // End the call in the database
    communicationService.endCall();
    
    // End the WebRTC connection
    peerConnection.endCall();
  }, [communicationService, peerConnection]);

  return {
    contacts: {
      onlineUsers: communicationService.onlineUsers,
      isOpen: isContactsOpen
    },
    chatWindows: communicationService.chatWindows,
    activeCall: communicationService.activeCall,
    isCallActive: communicationService.isCallActive,
    isCallIncoming: communicationService.isCallIncoming,
    localStream: peerConnection.localStream,
    remoteStream: peerConnection.remoteStream,
    toggleContacts,
    openChatWindow: communicationService.openChatWindow,
    closeChatWindow: communicationService.closeChatWindow,
    minimizeChatWindow: communicationService.minimizeChatWindow,
    sendMessage: communicationService.sendMessage,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio: peerConnection.toggleAudio,
    toggleVideo: peerConnection.toggleVideo
  };
}
