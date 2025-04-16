
import { useState, useCallback } from "react";
import { useAuth } from "../AuthContext";
import { useCommunicationService } from "@/hooks/useCommunicationService";
import { usePeerConnection } from "@/hooks/usePeerConnection";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

export function useCommunicationState() {
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isGroupCallModalOpen, setIsGroupCallModalOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const { user } = useAuth();
  
  // Use our communication service hook
  const communicationService = useCommunicationService();
  
  // Use our peer connection hook for WebRTC
  const peerConnection = usePeerConnection();

  const toggleContacts = useCallback(() => {
    setIsContactsOpen(prev => !prev);
  }, []);
  
  // Open group call modal
  const openGroupCallModal = useCallback(() => {
    setIsGroupCallModalOpen(true);
  }, []);
  
  // Close group call modal
  const closeGroupCallModal = useCallback(() => {
    setIsGroupCallModalOpen(false);
    setSelectedContacts([]);
  }, []);
  
  // Toggle contact selection for group calls
  const toggleContactSelection = useCallback((contactId: string) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  }, []);

  // Start a call - initialize both WebRTC and update database
  const startCall = useCallback(async (userId: string, userName: string, isVideo: boolean) => {
    if (!user) {
      toast.error("You must be logged in to start a call.");
      return;
    }

    // Start the database call tracking
    communicationService.startCall(userId, userName, isVideo);
    
    // Initialize WebRTC connection
    peerConnection.startCall(userId, isVideo);
  }, [user, communicationService, peerConnection]);
  
  // Start a group call with selected contacts
  const startGroupCall = useCallback(async (isVideo: boolean) => {
    if (!user) {
      toast.error("You must be logged in to start a group call.");
      return;
    }
    
    if (selectedContacts.length === 0) {
      toast.error("Please select at least one contact for the group call.");
      return;
    }
    
    // Create a room ID for the group call
    const roomId = uuidv4();
    
    // Create group call record in database
    try {
      const { error } = await supabase
        .from('group_calls')
        .insert({
          room_id: roomId,
          initiator_id: user.id,
          is_video_call: isVideo,
          status: 'active',
          participants: [user.id, ...selectedContacts]
        });
        
      if (error) throw error;
      
      // Initialize WebRTC connections to all participants
      peerConnection.startGroupCall(selectedContacts, isVideo, roomId);
      
      // Close the modal and reset selection
      closeGroupCallModal();
      
      // Notify contacts about the group call
      selectedContacts.forEach(contactId => {
        communicationService.sendGroupCallInvitation(contactId, roomId, isVideo);
      });
      
      toast.success(`Group call started with ${selectedContacts.length} participants`);
    } catch (error) {
      console.error('Error starting group call:', error);
      toast.error('Failed to start group call');
    }
  }, [user, selectedContacts, peerConnection, communicationService, closeGroupCallModal]);
  
  // Join an existing group call
  const joinGroupCall = useCallback(async (roomId: string, participantIds: string[], isVideo: boolean) => {
    if (!user) {
      toast.error("You must be logged in to join a call.");
      return;
    }
    
    try {
      // Update the group call record to include this user
      const { error } = await supabase
        .from('group_calls')
        .update({
          participants: [...participantIds, user.id]
        })
        .eq('room_id', roomId);
        
      if (error) throw error;
      
      // Join the WebRTC group call
      peerConnection.joinGroupCall(roomId, participantIds, isVideo);
      
      toast.success('Joined group call');
    } catch (error) {
      console.error('Error joining group call:', error);
      toast.error('Failed to join group call');
    }
  }, [user, peerConnection]);

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
    
    // If it's a group call, leave properly
    if (peerConnection.isGroupCall && peerConnection.roomId) {
      peerConnection.leaveGroupCall();
    }
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
    isGroupCallModalOpen,
    selectedContacts,
    remoteStreams: peerConnection.remoteStreams,
    localStream: peerConnection.localStream,
    isGroupCall: peerConnection.isGroupCall,
    participants: peerConnection.participants,
    toggleContacts,
    openChatWindow: communicationService.openChatWindow,
    closeChatWindow: communicationService.closeChatWindow,
    minimizeChatWindow: communicationService.minimizeChatWindow,
    sendMessage: communicationService.sendMessage,
    startCall,
    startGroupCall,
    joinGroupCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio: peerConnection.toggleAudio,
    toggleVideo: peerConnection.toggleVideo,
    openGroupCallModal,
    closeGroupCallModal,
    toggleContactSelection
  };
}
