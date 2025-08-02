import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  online_status: boolean;
  specialty?: string;
  organization?: string;
  last_seen?: string;
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message_at: string;
  last_message?: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
  };
}

export const useCommunication = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get current user's organization
      const { data: currentUserData, error: userError } = await supabase
        .from('users')
        .select('organization')
        .eq('user_id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user organization:', userError);
        return;
      }

      if (!currentUserData?.organization) {
        setUsers([]);
        return;
      }

      // Fetch all users in the same organization (excluding current user)
      const { data: orgUsers, error: orgError } = await supabase
        .from('users')
        .select('id, name, email, role, online_status, specialty, organization, last_seen')
        .eq('organization', currentUserData.organization)
        .neq('user_id', user.id)
        .order('online_status', { ascending: false }) // Online users first
        .order('last_seen', { ascending: false });

      if (orgError) {
        setError('Failed to fetch contacts');
        console.error('Error fetching users:', orgError);
        return;
      }

      setUsers(orgUsers || []);
      
      // Fetch conversations for each user
      if (orgUsers && orgUsers.length > 0) {
        await fetchConversations(orgUsers);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error in fetchUsers:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchConversations = async (orgUsers: User[]) => {
    if (!user?.id) return;

    const userConversations: Record<string, Conversation> = {};
    
    try {
      for (const contact of orgUsers) {
        // Get or create conversation between current user and contact
        const participant1 = user.id < contact.id ? user.id : contact.id;
        const participant2 = user.id < contact.id ? contact.id : user.id;
        
        // Try to find existing conversation
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('participant_1_id', participant1)
          .eq('participant_2_id', participant2)
          .maybeSingle();

        if (conversation) {
          // Get the latest message for this conversation
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('id, content, created_at, sender_id')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          userConversations[contact.id] = {
            ...conversation,
            last_message: lastMessage || undefined
          };
        } else {
          // Create placeholder conversation entry
          userConversations[contact.id] = {
            id: '',
            participant_1_id: participant1,
            participant_2_id: participant2,
            last_message_at: new Date().toISOString(),
            last_message: undefined
          };
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
    
    setConversations(userConversations);
  };

  const updateUserOnlineStatus = useCallback(async (isOnline: boolean) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('users')
        .update({ 
          online_status: isOnline,
          last_seen: isOnline ? null : new Date().toISOString()
        })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }, [user?.id]);

  // Set user as online when component mounts and offline when unmounts
  useEffect(() => {
    updateUserOnlineStatus(true);
    
    return () => {
      updateUserOnlineStatus(false);
    };
  }, [updateUserOnlineStatus]);

  // Handle browser tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      updateUserOnlineStatus(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateUserOnlineStatus]);

  // Real-time subscriptions for user status updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('communication-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updatedUser = payload.new as User;
            setUsers(prev => prev.map(u => 
              u.id === updatedUser.id ? { ...u, ...updatedUser } : u
            ));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as any;
          if (newMessage.conversation_id) {
            // Update conversation timestamp
            setConversations(prev => {
              const updated = { ...prev };
              Object.keys(updated).forEach(contactId => {
                if (updated[contactId].id === newMessage.conversation_id) {
                  updated[contactId] = {
                    ...updated[contactId],
                    last_message_at: newMessage.created_at,
                    last_message: {
                      id: newMessage.id,
                      content: newMessage.content,
                      created_at: newMessage.created_at,
                      sender_id: newMessage.sender_id
                    }
                  };
                }
              });
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    users,
    conversations,
    loading,
    error,
    fetchUsers,
    refreshData: fetchUsers
  };
};