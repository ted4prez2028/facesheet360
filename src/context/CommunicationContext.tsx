
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { User, Message, Call, ChatWindow } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { getUsers } from '@/lib/supabaseApi';

interface CommunicationContextType {
  onlineUsers: User[];
  chatWindows: ChatWindow[];
  currentCall: Call | null;
  isContactsOpen: boolean;
  toggleContacts: () => void;
  startChat: (userId: string, userName: string) => void;
  closeChat: (userId: string) => void;
  minimizeChat: (userId: string) => void;
  sendMessage: (userId: string, content: string) => void;
  startCall: (userId: string, userName: string, isVideo: boolean) => void;
  answerCall: () => void;
  endCall: () => void;
  addMessageToChat: (senderId: string, content: string) => void;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const CommunicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([]);
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  
  const localStream = useRef<MediaStream | null>(null);
  const peerConnections = useRef<{[key: string]: RTCPeerConnection}>({});
  const channelRef = useRef<any>(null);

  // Initialize and load online users
  useEffect(() => {
    if (!user) return;

    const loadUsers = async () => {
      try {
        const users = await getUsers();
        // Filter out current user
        const filteredUsers = users.filter(u => u.id !== user.id);
        setOnlineUsers(filteredUsers);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };

    loadUsers();
    
    // Set up realtime subscription for user presence
    const channel = supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        // Handle presence sync
        const presenceState = channel.presenceState();
        console.log('Current presence state:', presenceState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        // Update online users
        loadUsers();
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        // Update online users
        loadUsers();
      });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track user's online presence
        await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
          name: user.name
        });
      }
    });

    // Subscribe to messages channel for receiving messages
    const messageChannel = supabase.channel('private-messages')
      .on('broadcast', { event: 'message' }, payload => {
        const { sender_id, content, sender_name } = payload;
        
        // Check if chat window exists, if not create it
        if (!chatWindows.some(window => window.userId === sender_id)) {
          startChat(sender_id, sender_name);
        }
        
        // Add message to chat
        addMessageToChat(sender_id, content);
        
        // Play notification sound
        playNotificationSound();
      })
      .on('broadcast', { event: 'call-request' }, payload => {
        const { caller_id, caller_name, is_video } = payload;
        handleIncomingCall(caller_id, caller_name, is_video);
      })
      .on('broadcast', { event: 'call-answer' }, payload => {
        const { user_id } = payload;
        handleCallAnswered(user_id);
      })
      .on('broadcast', { event: 'call-end' }, payload => {
        const { user_id } = payload;
        handleCallEnded(user_id);
      });
      
    messageChannel.subscribe();

    channelRef.current = {
      presence: channel,
      messages: messageChannel
    };

    return () => {
      // Cleanup subscriptions and tracks
      if (channelRef.current?.presence) {
        channelRef.current.presence.untrack();
        supabase.removeChannel(channelRef.current.presence);
      }
      if (channelRef.current?.messages) {
        supabase.removeChannel(channelRef.current.messages);
      }
      
      // Cleanup WebRTC connections
      Object.values(peerConnections.current).forEach(connection => {
        connection.close();
      });
      
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [user]);

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(err => console.log('Error playing notification sound:', err));
  };

  const toggleContacts = () => {
    setIsContactsOpen(prev => !prev);
  };

  const startChat = (userId: string, userName: string) => {
    // Check if window already exists
    if (!chatWindows.some(window => window.userId === userId)) {
      setChatWindows(prev => [
        ...prev,
        {
          userId,
          userName,
          minimized: false,
          messages: []
        }
      ]);
    } else {
      // If minimized, maximize it
      setChatWindows(prev => 
        prev.map(window => 
          window.userId === userId 
            ? { ...window, minimized: false } 
            : window
        )
      );
    }
  };

  const closeChat = (userId: string) => {
    setChatWindows(prev => prev.filter(window => window.userId !== userId));
  };

  const minimizeChat = (userId: string) => {
    setChatWindows(prev => 
      prev.map(window => 
        window.userId === userId 
          ? { ...window, minimized: !window.minimized } 
          : window
      )
    );
  };

  const sendMessage = (userId: string, content: string) => {
    if (!user || !content.trim()) return;
    
    // Add to local chat window
    setChatWindows(prev => 
      prev.map(window => {
        if (window.userId === userId) {
          return {
            ...window,
            messages: [
              ...window.messages,
              {
                id: Date.now().toString(),
                sender_id: user.id,
                recipient_id: userId,
                content,
                timestamp: new Date().toISOString(),
                read: true
              }
            ]
          };
        }
        return window;
      })
    );
    
    // Send via Supabase channel
    channelRef.current?.messages.send({
      type: 'broadcast',
      event: 'message',
      payload: {
        sender_id: user.id,
        recipient_id: userId,
        content,
        sender_name: user.name,
        timestamp: new Date().toISOString()
      }
    });
  };

  const addMessageToChat = (senderId: string, content: string) => {
    // Find sender information
    const sender = onlineUsers.find(u => u.id === senderId);
    
    // If chat window doesn't exist, create it
    if (!chatWindows.some(window => window.userId === senderId) && sender) {
      setChatWindows(prev => [
        ...prev,
        {
          userId: senderId,
          userName: sender.name,
          minimized: false,
          messages: []
        }
      ]);
    }
    
    // Add message to chat window
    setChatWindows(prev => 
      prev.map(window => {
        if (window.userId === senderId) {
          return {
            ...window,
            messages: [
              ...window.messages,
              {
                id: Date.now().toString(),
                sender_id: senderId,
                recipient_id: user?.id || '',
                content,
                timestamp: new Date().toISOString(),
                read: true
              }
            ]
          };
        }
        return window;
      })
    );
  };

  const startCall = async (userId: string, userName: string, isVideo: boolean) => {
    if (!user) return;
    
    try {
      // Request user media (audio/video)
      const mediaConstraints = {
        audio: true,
        video: isVideo
      };
      
      localStream.current = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      
      // Set current call state
      setCurrentCall({
        callerId: user.id,
        callerName: user.name,
        receiverId: userId,
        receiverName: userName,
        isVideoCall: isVideo,
        status: 'ringing'
      });
      
      // Send call request via channel
      channelRef.current?.messages.send({
        type: 'broadcast',
        event: 'call-request',
        payload: {
          caller_id: user.id,
          caller_name: user.name,
          is_video: isVideo
        }
      });
      
      // Initialize WebRTC connection
      initializeWebRTC(userId);
      
      // Show toast notification
      toast({
        title: "Calling...",
        description: `Calling ${userName}`,
      });
      
    } catch (error) {
      console.error("Error starting call:", error);
      toast({
        title: "Call Failed",
        description: "Could not access camera or microphone",
        variant: "destructive"
      });
    }
  };

  const handleIncomingCall = (callerId: string, callerName: string, isVideo: boolean) => {
    // Set current call with incoming status
    setCurrentCall({
      callerId,
      callerName,
      receiverId: user?.id || '',
      receiverName: user?.name || '',
      isVideoCall: isVideo,
      status: 'ringing'
    });
    
    // Play ringtone
    const audio = new Audio('/ringtone.mp3');
    audio.loop = true;
    audio.play().catch(err => console.log('Error playing ringtone:', err));
    
    // Save reference to stop it later
    const ringtoneRef = audio;
    
    // Show toast notification
    toast({
      title: "Incoming Call",
      description: `${callerName} is calling you`,
      action: (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              ringtoneRef.pause();
              endCall();
            }}
          >
            Decline
          </Button>
          <Button 
            size="sm" 
            onClick={() => {
              ringtoneRef.pause();
              answerCall();
            }}
          >
            Answer
          </Button>
        </div>
      ),
      duration: 30000, // 30 seconds
    });
  };

  const answerCall = async () => {
    if (!currentCall) return;
    
    try {
      // Request user media (audio/video)
      const mediaConstraints = {
        audio: true,
        video: currentCall.isVideoCall
      };
      
      localStream.current = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      
      // Update call status
      setCurrentCall(prev => prev ? { ...prev, status: 'ongoing' } : null);
      
      // Send answer via channel
      channelRef.current?.messages.send({
        type: 'broadcast',
        event: 'call-answer',
        payload: {
          user_id: currentCall.callerId
        }
      });
      
      // Initialize WebRTC connection
      initializeWebRTC(currentCall.callerId);
      
    } catch (error) {
      console.error("Error answering call:", error);
      toast({
        title: "Call Failed",
        description: "Could not access camera or microphone",
        variant: "destructive"
      });
      endCall();
    }
  };

  const handleCallAnswered = (userId: string) => {
    if (!currentCall) return;
    
    // Update call status
    setCurrentCall(prev => prev ? { ...prev, status: 'ongoing' } : null);
  };

  const initializeWebRTC = (remotePeerId: string) => {
    // Create new RTCPeerConnection
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    
    // Add local stream tracks to connection
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream.current!);
      });
    }
    
    // Set up event handlers
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        // Send ICE candidate to remote peer via signaling channel
        channelRef.current?.messages.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            candidate: event.candidate,
            user_id: remotePeerId
          }
        });
      }
    };
    
    peerConnection.ontrack = event => {
      // Handle incoming remote stream
      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      if (remoteVideo && event.streams[0]) {
        remoteVideo.srcObject = event.streams[0];
      }
    };
    
    // Store connection
    peerConnections.current[remotePeerId] = peerConnection;
  };

  const endCall = () => {
    // Send call end notification
    if (currentCall) {
      channelRef.current?.messages.send({
        type: 'broadcast',
        event: 'call-end',
        payload: {
          user_id: currentCall.callerId === user?.id ? currentCall.receiverId : currentCall.callerId
        }
      });
    }
    
    // Clear call state
    setCurrentCall(null);
    
    // Stop local media tracks
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    
    // Close peer connections
    Object.values(peerConnections.current).forEach(connection => {
      connection.close();
    });
    peerConnections.current = {};
  };

  const handleCallEnded = (userId: string) => {
    endCall();
    
    toast({
      title: "Call Ended",
      description: "The call has ended"
    });
  };

  const value = {
    onlineUsers,
    chatWindows,
    currentCall,
    isContactsOpen,
    toggleContacts,
    startChat,
    closeChat,
    minimizeChat,
    sendMessage,
    startCall,
    answerCall,
    endCall,
    addMessageToChat
  };

  return (
    <CommunicationContext.Provider value={value}>
      {children}
    </CommunicationContext.Provider>
  );
};

export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (context === undefined) {
    throw new Error('useCommunication must be used within a CommunicationProvider');
  }
  return context;
};
