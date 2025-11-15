
import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Peer from "peerjs";
import { toast } from "sonner";

interface ChatWindow {
  id: string;
  userId: string;
  userName: string;
  isMinimized: boolean;
  messages: Message[];
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

interface OnlineUser {
  id: string;
  name: string;
  role: string;
  online_status: boolean;
}

export function useCommunicationState() {
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCallIncoming, setIsCallIncoming] = useState(false);
  const [isGroupCallModalOpen, setIsGroupCallModalOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isGroupCall, setIsGroupCall] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const { user } = useAuth();
  const peerRef = useRef<Peer | null>(null);

  // Fetch online users
  useEffect(() => {
    if (!user) return;

    const fetchOnlineUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, online_status')
        .eq('online_status', true)
        .neq('id', user.id);

      if (!error && data) {
        setOnlineUsers(data);
      }
    };

    fetchOnlineUsers();

    // Subscribe to presence changes
    const channel = supabase.channel('online-users')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchOnlineUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Update user's online status
  useEffect(() => {
    if (!user?.id) return;

    const updateStatus = async (online: boolean) => {
      await supabase
        .from('profiles')
        .update({ online_status: online, last_seen: new Date().toISOString() })
        .eq('id', user.id);
    };

    updateStatus(true);

    const handleBeforeUnload = () => {
      updateStatus(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      updateStatus(false);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user?.id]);

  const toggleContacts = useCallback(() => {
    setIsContactsOpen(prev => !prev);
  }, []);

  const openChatWindow = useCallback(async (userId: string, userName: string) => {
    if (chatWindows.find(w => w.userId === userId)) {
      // Window already open, just unminimize it
      setChatWindows(prev => prev.map(w => 
        w.userId === userId ? { ...w, isMinimized: false } : w
      ));
      return;
    }

    // Fetch conversation and messages
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant_1_id.eq.${user?.id},participant_2_id.eq.${userId}),and(participant_1_id.eq.${userId},participant_2_id.eq.${user?.id})`)
      .single();

    let messages: Message[] = [];
    if (conversation) {
      const { data: msgData } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });
      
      if (msgData) {
        messages = msgData.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          content: m.content,
          timestamp: m.created_at
        }));
      }
    }

    setChatWindows(prev => [...prev, {
      id: crypto.randomUUID(),
      userId,
      userName,
      isMinimized: false,
      messages
    }]);
  }, [chatWindows, user?.id]);

  const closeChatWindow = useCallback((windowId: string) => {
    setChatWindows(prev => prev.filter(w => w.id !== windowId));
  }, []);

  const minimizeChatWindow = useCallback((windowId: string) => {
    setChatWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
    ));
  }, []);

  const sendMessage = useCallback(async (windowId: string, content: string) => {
    const window = chatWindows.find(w => w.id === windowId);
    if (!window || !user?.id) return;

    // Get or create conversation
    let conversationId: string;
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${window.userId}),and(participant_1_id.eq.${window.userId},participant_2_id.eq.${user.id})`)
      .single();

    if (existingConv) {
      conversationId = existingConv.id;
    } else {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: user.id,
          participant_2_id: window.userId,
          last_message_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (!newConv) return;
      conversationId = newConv.id;
    }

    // Insert message
    const { data: newMsg, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        recipient_id: window.userId,
        content,
        message_type: 'text'
      })
      .select()
      .single();

    if (!error && newMsg) {
      setChatWindows(prev => prev.map(w => 
        w.id === windowId 
          ? { 
              ...w, 
              messages: [...w.messages, {
                id: newMsg.id,
                senderId: user.id,
                content,
                timestamp: newMsg.created_at
              }]
            }
          : w
      ));
    }
  }, [chatWindows, user?.id]);

  const startCall = useCallback(async (userId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsCallActive(true);
      
      if (!peerRef.current) {
        peerRef.current = new Peer(user?.id || '');
      }

      const call = peerRef.current.call(userId, stream);
      call.on('stream', (remoteStream) => {
        setRemoteStreams(new Map([[userId, remoteStream]]));
      });
      
      setActiveCall(call);
      toast.success('Call started');
    } catch (error) {
      toast.error('Failed to start call');
      console.error(error);
    }
  }, [user?.id]);

  const acceptCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      
      if (activeCall) {
        activeCall.answer(stream);
        setIsCallActive(true);
        setIsCallIncoming(false);
      }
    } catch (error) {
      toast.error('Failed to accept call');
      console.error(error);
    }
  }, [activeCall]);

  const rejectCall = useCallback(() => {
    if (activeCall) {
      activeCall.close();
    }
    setIsCallIncoming(false);
    setActiveCall(null);
  }, [activeCall]);

  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (activeCall) {
      activeCall.close();
    }
    setLocalStream(null);
    setActiveCall(null);
    setIsCallActive(false);
    setRemoteStreams(new Map());
    toast.info('Call ended');
  }, [localStream, activeCall]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }, [localStream]);

  const startGroupCall = useCallback((contactIds: string[]) => {
    setIsGroupCall(true);
    setParticipants(contactIds);
    setIsGroupCallModalOpen(false);
    toast.success('Group call started');
  }, []);

  const joinGroupCall = useCallback((callId: string) => {
    toast.info('Joining group call...');
  }, []);

  const openGroupCallModal = useCallback(() => {
    setIsGroupCallModalOpen(true);
  }, []);

  const closeGroupCallModal = useCallback(() => {
    setIsGroupCallModalOpen(false);
    setSelectedContacts([]);
  }, []);

  const toggleContactSelection = useCallback((contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  }, []);

  return {
    contacts: {
      onlineUsers,
      isOpen: isContactsOpen
    },
    chatWindows,
    activeCall,
    isCallActive,
    isCallIncoming,
    isGroupCallModalOpen,
    selectedContacts,
    remoteStreams,
    localStream,
    isGroupCall,
    participants,
    toggleContacts,
    openChatWindow,
    closeChatWindow,
    minimizeChatWindow,
    sendMessage,
    startCall,
    startGroupCall,
    joinGroupCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    openGroupCallModal,
    closeGroupCallModal,
    toggleContactSelection
  };
}
