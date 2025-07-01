
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { User, Message, Call, ChatWindow } from '@/types';

export const useCommunicationService = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([]);
  const [activeCalls, setActiveCalls] = useState<Call[]>([]);

  // Fetch online users
  const fetchOnlineUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('online_status', true)
        .neq('id', user?.id);

      if (error) throw error;
      
      const usersWithBalance = data.map(u => ({
        ...u,
        care_coins_balance: u.care_coins_balance || 0
      }));
      
      setOnlineUsers(usersWithBalance);
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  // Send message
  const sendMessage = async (toUserId: string, content: string) => {
    if (!user?.id) return;

    try {
      const messageData = {
        from_user_id: user.id,
        to_user_id: toUserId,
        content: content,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) throw error;

      // Update chat window with new message
      const message: Message = {
        id: crypto.randomUUID(),
        from_user_id: user.id,
        to_user_id: toUserId,
        content: content,
        created_at: new Date().toISOString()
      };

      updateChatWindow(toUserId, message);
      
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Update chat window with new message
  const updateChatWindow = (userId: string, message: Message) => {
    setChatWindows(prev => 
      prev.map(window => 
        window.userId === userId 
          ? { ...window }
          : window
      )
    );
  };

  // Open chat window
  const openChatWindow = (userId: string, userName: string) => {
    setChatWindows(prev => {
      const existing = prev.find(w => w.userId === userId);
      if (existing) {
        return prev.map(w => 
          w.userId === userId 
            ? { ...w, minimized: false }
            : w
        );
      }
      
      return [...prev, {
        userId,
        userName,
        minimized: false
      }];
    });
  };

  // Close chat window
  const closeChatWindow = (userId: string) => {
    setChatWindows(prev => prev.filter(w => w.userId !== userId));
  };

  // Minimize/restore chat window
  const toggleChatWindow = (userId: string) => {
    setChatWindows(prev => 
      prev.map(w => 
        w.userId === userId 
          ? { ...w, minimized: !w.minimized }
          : w
      )
    );
  };

  // Initialize call
  const initializeCall = async (toUserId: string, isVideo: boolean = false) => {
    if (!user?.id) return;

    try {
      const callData = {
        from_user_id: user.id,
        to_user_id: toUserId,
        isVideo: isVideo,
        accepted: false,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('calls')
        .insert(callData)
        .select()
        .single();

      if (error) throw error;

      const call: Call = {
        id: data.id,
        from_user_id: user.id,
        to_user_id: toUserId,
        isVideo: isVideo,
        accepted: false,
        ended_at: null,
        created_at: data.created_at
      };

      setActiveCalls(prev => [...prev, call]);
      
      toast.success(`${isVideo ? 'Video' : 'Audio'} call initiated`);
      return call;
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Failed to initiate call');
    }
  };

  // Accept call
  const acceptCall = async (callId: string) => {
    try {
      const { error } = await supabase
        .from('calls')
        .update({ accepted: true })
        .eq('id', callId);

      if (error) throw error;

      setActiveCalls(prev => 
        prev.map(call => 
          call.id === callId 
            ? { ...call, accepted: true }
            : call
        )
      );

      toast.success('Call accepted');
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error('Failed to accept call');
    }
  };

  // End call
  const endCall = async (callId: string) => {
    try {
      const { error } = await supabase
        .from('calls')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', callId);

      if (error) throw error;

      setActiveCalls(prev => prev.filter(call => call.id !== callId));
      
      toast.success('Call ended');
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Failed to end call');
    }
  };

  // Update user online status
  const updateOnlineStatus = async (isOnline: boolean) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          online_status: isOnline,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchOnlineUsers();
      updateOnlineStatus(true);

      // Set up real-time subscriptions
      const messagesChannel = supabase
        .channel('messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `to_user_id=eq.${user.id}`
        }, (payload) => {
          const message = payload.new as Message;
          updateChatWindow(message.from_user_id!, message);
        })
        .subscribe();

      const callsChannel = supabase
        .channel('calls')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'calls',
          filter: `to_user_id=eq.${user.id}`
        }, (payload) => {
          const call = payload.new as Call;
          setActiveCalls(prev => [...prev, call]);
          toast.info(`Incoming ${call.isVideo ? 'video' : 'audio'} call`);
        })
        .subscribe();

      // Cleanup on unmount
      return () => {
        updateOnlineStatus(false);
        messagesChannel.unsubscribe();
        callsChannel.unsubscribe();
      };
    }
  }, [user?.id]);

  return {
    onlineUsers,
    chatWindows,
    activeCalls,
    sendMessage,
    openChatWindow,
    closeChatWindow,
    toggleChatWindow,
    initializeCall,
    acceptCall,
    endCall,
    fetchOnlineUsers
  };
};
