import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Send, Phone, Video, Minimize2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  author: string;
  sender_id: string;
  recipient_id?: string;
  conversation_id?: string;
  created_at: string;
  message_type?: string;
  platform: string;
  is_read?: boolean;
}

interface ChatWindowProps {
  contactId: string;
  contactName: string;
  onClose: () => void;
  onMinimize?: () => void;
  onStartCall: () => void;
  onStartVideoCall: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  contactId, 
  contactName, 
  onClose, 
  onMinimize,
  onStartCall, 
  onStartVideoCall 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Flush any offline messages when coming online
  useEffect(() => {
    const flushOfflineMessages = async () => {
      if (!conversationId || !user?.id) return;

      const stored = localStorage.getItem('offlineMessages');
      if (!stored) return;
      const queue: any[] = JSON.parse(stored);
      const remaining: any[] = [];

      for (const msg of queue) {
        if (msg.conversation_id !== conversationId) {
          remaining.push(msg);
          continue;
        }

        try {
          const { data, error } = await supabase
            .from('messages')
            .insert([{ ...msg }])
            .select()
            .single();

          if (error) throw error;

          setMessages(prev =>
            prev.map(m => (m.id === msg.client_id ? data : m))
          );
        } catch {
          remaining.push(msg);
        }
      }

      if (remaining.length > 0) {
        localStorage.setItem('offlineMessages', JSON.stringify(remaining));
      } else {
        localStorage.removeItem('offlineMessages');
      }
    };

    if (navigator.onLine) {
      flushOfflineMessages();
    }

    window.addEventListener('online', flushOfflineMessages);
    return () => window.removeEventListener('online', flushOfflineMessages);
  }, [conversationId, user?.id]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages for this conversation
  useEffect(() => {
    const loadMessages = async () => {
      if (!user?.id || !contactId) return;
      
      setLoading(true);
      try {
        // Get or create conversation
        const participant1 = user.id < contactId ? user.id : contactId;
        const participant2 = user.id < contactId ? contactId : user.id;
        
        // First try to find existing conversation
        const { data: existingConv, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('participant_1_id', participant1)
          .eq('participant_2_id', participant2)
          .maybeSingle();

        let conversation = existingConv;

        // If no conversation exists, create one
        if (!conversation && !convError) {
          const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert({
              participant_1_id: participant1,
              participant_2_id: participant2
            })
            .select()
            .single();
          
          if (!createError) {
            conversation = newConv;
          }
        }

        if (conversation) {
          // Load messages for this conversation
          const { data: messagesData, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: true });

          if (!msgError && messagesData) {
            setMessages(messagesData);
          }
          
          // Store conversation ID for sending messages
          setConversationId(conversation.id);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [user?.id, contactId]);

  // Real-time message subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => {
            // Avoid duplicates
            if (prev.find(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id || !conversationId) return;

    const messageData = {
      content: newMessage.trim(),
      conversation_id: conversationId,
      sender_id: user.id,
      recipient_id: contactId,
      author: user.name || user.email || 'Unknown',
      platform: 'web',
      user_id: user.id,
      created_at: new Date().toISOString(),
      is_read: false
    };

    // Optimistically add message to UI
    const tempMessage = {
      ...messageData,
      id: `temp-${Date.now()}`
    };
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      // Replace temp message with real message
      setMessages(prev =>
        prev.map(msg => (msg.id === tempMessage.id ? data : msg))
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // Queue message for later sync
      const stored = localStorage.getItem('offlineMessages');
      const queue = stored ? JSON.parse(stored) : [];
      queue.push({ ...messageData, client_id: tempMessage.id });
      localStorage.setItem('offlineMessages', JSON.stringify(queue));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="w-80 h-96 shadow-lg bg-background border">
      <CardHeader className="pb-2 px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={contactName} />
              <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                {contactName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-sm font-medium">{contactName}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={onStartCall}
            >
              <Phone className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={onStartVideoCall}
            >
              <Video className="h-3 w-3" />
            </Button>
            {onMinimize && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 hover:bg-muted"
                onClick={onMinimize}
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-80">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm text-center">Start your conversation with {contactName}</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg ${
                    message.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className="p-3 border-t bg-muted/30">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 text-sm"
              disabled={loading || !conversationId}
            />
            <Button 
              onClick={handleSendMessage}
              size="sm" 
              disabled={!newMessage.trim() || loading || !conversationId}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;