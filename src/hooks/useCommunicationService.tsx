
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Message {
  id: string;
  content: string;
  author: string;
  platform: string;
  user_id: string;
  created_at: string;
  is_read: boolean;
  message_type?: string;
  replied?: boolean;
  reply_content?: string;
  replied_at?: string;
  updated_at?: string;
}

export interface Call {
  id: string;
  caller_id: string;
  callee_id: string;
  status: 'pending' | 'active' | 'ended' | 'missed';
  is_video_call: boolean;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  updated_at?: string;
}

export const useCommunicationService = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchMessages();
      fetchCalls();
    }
  }, [user?.id]);

  const fetchMessages = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchCalls = async () => {
    if (!user?.id) return;

    try {
      // Note: Since 'calls' table doesn't exist in the current schema,
      // we'll use an empty array for now
      setCalls([]);
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, recipientId: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    const messageData = {
      content,
      author: user.name || 'Unknown',
      platform: 'web',
      user_id: user.id,
      created_at: new Date().toISOString(),
      is_read: false
    };

    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (error) throw error;

    // Refresh messages
    await fetchMessages();
    
    return data;
  };

  const startCall = async (calleeId: string, isVideo: boolean = false) => {
    if (!user?.id) throw new Error('User not authenticated');

    // For now, just return a mock call since the calls table doesn't exist
    const mockCall: Call = {
      id: `call_${Date.now()}`,
      caller_id: user.id,
      callee_id: calleeId,
      status: 'pending',
      is_video_call: isVideo,
      created_at: new Date().toISOString()
    };

    return mockCall;
  };

  const endCall = async (callId: string) => {
    // Mock implementation
    console.log('Ending call:', callId);
  };

  const markMessageAsRead = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) throw error;

    // Refresh messages
    await fetchMessages();
  };

  return {
    messages,
    calls,
    isLoading,
    sendMessage,
    startCall,
    endCall,
    markMessageAsRead,
    refreshMessages: fetchMessages,
    refreshCalls: fetchCalls
  };
};
