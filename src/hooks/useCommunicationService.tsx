
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Message, Call, ChatWindow } from '@/types';
import { toast } from 'sonner';

export function useCommunicationService() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([]);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [isCallIncoming, setIsCallIncoming] = useState<boolean>(false);
  
  // Load online users - in a real app, we would use Supabase presence
  const fetchOnlineUsers = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', user.id)
        .order('name', { ascending: true });
        
      if (error) throw error;
      setOnlineUsers(data || []);
    } catch (error) {
      console.error('Error fetching online users:', error);
      toast.error('Failed to load contacts');
    }
  }, [user]);
  
  // Update user online status and set up presence
  useEffect(() => {
    if (!user) return;
    
    // Set current user as online
    const updateOnlineStatus = async () => {
      await supabase
        .from('users')
        .update({ online_status: true, last_seen: new Date().toISOString() })
        .eq('id', user.id);
    };
    
    updateOnlineStatus();
    fetchOnlineUsers();
    
    // Set up presence channel for real-time online status
    const channel = supabase.channel('online-users')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users' },
        (payload) => {
          // Update online users when status changes
          fetchOnlineUsers();
        }
      )
      .subscribe();
    
    // Set user as offline when component unmounts
    return () => {
      supabase
        .from('users')
        .update({ online_status: false, last_seen: new Date().toISOString() })
        .eq('id', user.id)
        .then();
      
      supabase.removeChannel(channel);
    };
  }, [user, fetchOnlineUsers]);
  
  // Fetch messages when chat windows are opened
  useEffect(() => {
    if (!user || chatWindows.length === 0) return;
    
    // Set up subscription for new messages
    const channel = supabase.channel('new-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Only handle messages relevant to the current user
          if (newMessage.sender_id === user.id || newMessage.recipient_id === user.id) {
            setChatWindows(prev => prev.map(window => {
              const otherUserId = newMessage.sender_id === user.id 
                ? newMessage.recipient_id 
                : newMessage.sender_id;
                
              if (window.userId === otherUserId) {
                // Find if this window already has this message
                const messageExists = window.messages.some(msg => msg.id === newMessage.id);
                if (!messageExists) {
                  return {
                    ...window,
                    messages: [...window.messages, newMessage]
                  };
                }
              }
              return window;
            }));
          }
        }
      )
      .subscribe();
    
    // Load message history for each chat window
    chatWindows.forEach(async (window) => {
      // Skip if window already has messages
      if (window.messages.length > 0) return;
      
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .or(`sender_id.eq.${window.userId},recipient_id.eq.${window.userId}`)
          .order('timestamp', { ascending: true });
          
        if (error) throw error;
        
        // Filter messages that belong to this conversation
        const windowMessages = (data || []).filter(msg => 
          (msg.sender_id === user.id && msg.recipient_id === window.userId) ||
          (msg.sender_id === window.userId && msg.recipient_id === user.id)
        );
        
        setChatWindows(prev => prev.map(w => 
          w.userId === window.userId 
            ? { ...w, messages: windowMessages } 
            : w
        ));
      } catch (error) {
        console.error(`Error loading messages for ${window.userName}:`, error);
        toast.error(`Failed to load messages for ${window.userName}`);
      }
    });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, chatWindows]);
  
  // Set up listener for active calls
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase.channel('active-calls')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_calls' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const call = payload.new as any;
            
            // If the current user is the receiver, show incoming call
            if (call.receiver_id === user.id) {
              // Find caller name
              const { data: callerData } = await supabase
                .from('users')
                .select('name')
                .eq('id', call.caller_id)
                .single();
                
              const callerName = callerData?.name || 'Unknown';
              
              setActiveCall({
                callerId: call.caller_id,
                callerName,
                receiverId: call.receiver_id,
                receiverName: user.name,
                isVideoCall: call.is_video_call,
                status: 'ringing'
              });
              
              setIsCallIncoming(true);
              setIsCallActive(true);
              
              // Play ring tone
              const audio = new Audio('/ringtone.mp3');
              audio.loop = true;
              audio.play().catch(e => console.log('Could not play ringtone', e));
              
              // Store audio element in window to be able to stop it later
              (window as any).incomingCallAudio = audio;
            }
          } else if (payload.eventType === 'UPDATE') {
            const call = payload.new as any;
            
            // Update call status if user is part of this call
            if (call.caller_id === user.id || call.receiver_id === user.id) {
              if (call.call_status === 'ended') {
                setActiveCall(null);
                setIsCallActive(false);
                setIsCallIncoming(false);
                
                // Stop ringtone if playing
                if ((window as any).incomingCallAudio) {
                  (window as any).incomingCallAudio.pause();
                  (window as any).incomingCallAudio = null;
                }
              } else if (call.call_status === 'ongoing') {
                setActiveCall(prev => prev ? { ...prev, status: 'ongoing' } : null);
                setIsCallIncoming(false);
                
                // Stop ringtone if playing
                if ((window as any).incomingCallAudio) {
                  (window as any).incomingCallAudio.pause();
                  (window as any).incomingCallAudio = null;
                }
              }
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  // Open chat window with a user
  const openChatWindow = useCallback(async (userId: string, userName: string) => {
    setChatWindows(prev => {
      // Check if window already exists
      if (prev.find(window => window.userId === userId)) {
        return prev.map(window => window.userId === userId 
          ? { ...window, minimized: false } 
          : window
        );
      }
      return [...prev, { userId, userName, minimized: false, messages: [] }];
    });
  }, []);
  
  // Close chat window
  const closeChatWindow = useCallback((userId: string) => {
    setChatWindows(prev => prev.filter(window => window.userId !== userId));
  }, []);
  
  // Minimize chat window
  const minimizeChatWindow = useCallback((userId: string) => {
    setChatWindows(prev => prev.map(window => 
      window.userId === userId 
        ? { ...window, minimized: !window.minimized } 
        : window
    ));
  }, []);
  
  // Send message
  const sendMessage = useCallback(async (recipientId: string, content: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          timestamp: new Date().toISOString(),
          read: false
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Message will be added to chat window via the realtime subscription
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // Optimistically add message to chat window
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        sender_id: user.id,
        recipient_id: recipientId,
        content,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setChatWindows(prev => prev.map(window => 
        window.userId === recipientId 
          ? { ...window, messages: [...window.messages, tempMessage] } 
          : window
      ));
    }
  }, [user]);
  
  // Start call
  const startCall = useCallback(async (userId: string, userName: string, isVideo: boolean) => {
    if (!user) return;
    
    try {
      // Create active call in database
      const { data, error } = await supabase
        .from('active_calls')
        .insert({
          caller_id: user.id,
          receiver_id: userId,
          is_video_call: isVideo,
          call_status: 'ringing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Set active call in local state
      setActiveCall({
        callerId: user.id,
        callerName: user.name,
        receiverId: userId,
        receiverName: userName,
        isVideoCall: isVideo,
        status: 'ringing'
      });
      
      setIsCallActive(true);
      setIsCallIncoming(false);
      
      toast("Calling...", {
        description: `Calling ${userName}...`,
      });
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start call');
    }
  }, [user]);
  
  // Accept call
  const acceptCall = useCallback(async () => {
    if (!user || !activeCall) return;
    
    try {
      // Update call status in database
      const { error } = await supabase
        .from('active_calls')
        .update({
          call_status: 'ongoing',
          updated_at: new Date().toISOString()
        })
        .or(`caller_id.eq.${activeCall.callerId},receiver_id.eq.${activeCall.callerId}`)
        .or(`caller_id.eq.${activeCall.receiverId},receiver_id.eq.${activeCall.receiverId}`);
        
      if (error) throw error;
      
      setActiveCall(prev => prev ? { ...prev, status: 'ongoing' } : null);
      setIsCallIncoming(false);
      setIsCallActive(true);
      
      // Stop ringtone if playing
      if ((window as any).incomingCallAudio) {
        (window as any).incomingCallAudio.pause();
        (window as any).incomingCallAudio = null;
      }
      
      toast("Call Connected", {
        description: `Call connected with ${activeCall.callerName || activeCall.receiverName}`,
      });
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error('Failed to accept call');
    }
  }, [user, activeCall]);
  
  // Reject/end call
  const endCall = useCallback(async () => {
    if (!user || !activeCall) return;
    
    try {
      // Update call status in database
      const { error } = await supabase
        .from('active_calls')
        .update({
          call_status: 'ended',
          updated_at: new Date().toISOString()
        })
        .or(`caller_id.eq.${activeCall.callerId},receiver_id.eq.${activeCall.callerId}`)
        .or(`caller_id.eq.${activeCall.receiverId},receiver_id.eq.${activeCall.receiverId}`);
        
      if (error) throw error;
      
      // Stop ringtone if playing
      if ((window as any).incomingCallAudio) {
        (window as any).incomingCallAudio.pause();
        (window as any).incomingCallAudio = null;
      }
      
      setActiveCall(null);
      setIsCallIncoming(false);
      setIsCallActive(false);
      
      toast("Call Ended", {
        description: `Call ended with ${activeCall.callerName || activeCall.receiverName}`,
      });
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Failed to end call');
    }
  }, [user, activeCall]);
  
  return {
    onlineUsers,
    chatWindows,
    activeCall,
    isCallActive,
    isCallIncoming,
    openChatWindow,
    closeChatWindow,
    minimizeChatWindow,
    sendMessage,
    startCall,
    acceptCall,
    endCall,
    fetchOnlineUsers
  };
}
