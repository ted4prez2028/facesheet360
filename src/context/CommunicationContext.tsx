
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { User, Message, Call, ChatWindow } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { getUsers } from '@/lib/supabaseApi';
import { Button } from '@/components/ui/button';

interface CommunicationContextType {
  onlineUsers: User[];
  allUsers: User[];
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
  setCallActive?: (active: boolean) => void;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const CommunicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([]);
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  
  const localStream = useRef<MediaStream | null>(null);
  const peerConnections = useRef<{[key: string]: RTCPeerConnection}>({});
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    const loadUsers = async () => {
      try {
        const users = await getUsers();
        const filteredUsers = users.filter(u => u.id !== user.id);
        setAllUsers(filteredUsers);
        setOnlineUsers(filteredUsers);
      } catch (error) {
        console.error("Error loading users:", error);
        toast.error("Error loading users");
      }
    };

    loadUsers();
    
    try {
      const channel = supabase.channel('online-users')
        .on('presence', { event: 'sync' }, () => {
          const presenceState = channel.presenceState();
          console.log('Current presence state:', presenceState);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
          loadUsers();
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
          loadUsers();
        });

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
              name: user.name
            });
          } catch (error) {
            console.error("Error tracking user presence:", error);
          }
        }
      });

      const messageChannel = supabase.channel('private-messages')
        .on('broadcast', { event: 'message' }, payload => {
          const { sender_id, content, sender_name } = payload;
          
          if (!chatWindows.some(window => window.userId === sender_id)) {
            startChat(sender_id, sender_name);
          }
          
          addMessageToChat(sender_id, content);
          
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
        })
        .on('broadcast', { event: 'ice-candidate' }, payload => {
          const { candidate, user_id } = payload;
          handleIceCandidate(user_id, candidate);
        });
        
      messageChannel.subscribe();

      channelRef.current = {
        presence: channel,
        messages: messageChannel
      };
    } catch (error) {
      console.error("Error setting up Supabase channels:", error);
    }

    return () => {
      if (channelRef.current?.presence) {
        try {
          channelRef.current.presence.untrack();
          supabase.removeChannel(channelRef.current.presence);
        } catch (error) {
          console.error("Error removing presence channel:", error);
        }
      }
      if (channelRef.current?.messages) {
        try {
          supabase.removeChannel(channelRef.current.messages);
        } catch (error) {
          console.error("Error removing message channel:", error);
        }
      }
      
      Object.values(peerConnections.current).forEach(connection => {
        connection.close();
      });
      
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [user]);

  const handleIceCandidate = (userId: string, candidate: RTCIceCandidate) => {
    if (peerConnections.current[userId]) {
      peerConnections.current[userId].addIceCandidate(new RTCIceCandidate(candidate))
        .catch(err => console.error("Error adding ice candidate:", err));
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(err => console.log('Error playing notification sound:', err));
  };

  const toggleContacts = () => {
    setIsContactsOpen(prev => !prev);
  };

  const startChat = (userId: string, userName: string) => {
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
    
    try {
      if (channelRef.current?.messages) {
        channelRef.current.messages.send({
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
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    }
  };

  const addMessageToChat = (senderId: string, content: string) => {
    const sender = allUsers.find(u => u.id === senderId);
    
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
      const mediaConstraints = {
        audio: true,
        video: isVideo
      };
      
      localStream.current = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      
      setCurrentCall({
        callerId: user.id,
        callerName: user.name,
        receiverId: userId,
        receiverName: userName,
        isVideoCall: isVideo,
        status: 'ringing'
      });
      
      try {
        if (channelRef.current?.messages) {
          channelRef.current.messages.send({
            type: 'broadcast',
            event: 'call-request',
            payload: {
              caller_id: user.id,
              caller_name: user.name,
              is_video: isVideo
            }
          });
        }
      } catch (error) {
        console.error("Error sending call request:", error);
        toast.error("Error initiating call");
        endCall();
        return;
      }
      
      initializeWebRTC(userId);
      
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
    setCurrentCall({
      callerId,
      callerName,
      receiverId: user?.id || '',
      receiverName: user?.name || '',
      isVideoCall: isVideo,
      status: 'ringing'
    });
    
    const audio = new Audio('/ringtone.mp3');
    audio.loop = true;
    audio.play().catch(err => console.log('Error playing ringtone:', err));
    
    const ringtoneRef = audio;
    
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
      duration: 30000,
    });
  };

  const answerCall = async () => {
    if (!currentCall) return;
    
    try {
      const mediaConstraints = {
        audio: true,
        video: currentCall.isVideoCall
      };
      
      localStream.current = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      
      setCurrentCall(prev => prev ? { ...prev, status: 'ongoing' } : null);
      
      try {
        if (channelRef.current?.messages) {
          channelRef.current.messages.send({
            type: 'broadcast',
            event: 'call-answer',
            payload: {
              user_id: currentCall.callerId
            }
          });
        }
      } catch (error) {
        console.error("Error sending call answer:", error);
        toast.error("Error answering call");
        endCall();
        return;
      }
      
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
    
    setCurrentCall(prev => prev ? { ...prev, status: 'ongoing' } : null);
  };

  const initializeWebRTC = (remotePeerId: string) => {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream.current!);
        });
      }
      
      peerConnection.onicecandidate = event => {
        if (event.candidate && channelRef.current?.messages) {
          try {
            channelRef.current.messages.send({
              type: 'broadcast',
              event: 'ice-candidate',
              payload: {
                candidate: event.candidate,
                user_id: remotePeerId
              }
            });
          } catch (error) {
            console.error("Error sending ICE candidate:", error);
          }
        }
      };
      
      peerConnection.ontrack = event => {
        const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
        if (remoteVideo && event.streams[0]) {
          remoteVideo.srcObject = event.streams[0];
        }
      };
      
      peerConnection.onnegotiationneeded = async () => {
        try {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          
          if (channelRef.current?.messages) {
            channelRef.current.messages.send({
              type: 'broadcast',
              event: 'offer',
              payload: {
                offer: peerConnection.localDescription,
                user_id: remotePeerId
              }
            });
          }
        } catch (error) {
          console.error("Error creating offer:", error);
        }
      };
      
      peerConnections.current[remotePeerId] = peerConnection;
    } catch (error) {
      console.error("Error initializing WebRTC:", error);
      toast.error("Error establishing call connection");
    }
  };

  const endCall = () => {
    if (currentCall) {
      try {
        if (channelRef.current?.messages) {
          channelRef.current.messages.send({
            type: 'broadcast',
            event: 'call-end',
            payload: {
              user_id: currentCall.callerId === user?.id ? currentCall.receiverId : currentCall.callerId
            }
          });
        }
      } catch (error) {
        console.error("Error sending call end signal:", error);
      }
    }
    
    setCurrentCall(null);
    
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    
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
    allUsers,
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
