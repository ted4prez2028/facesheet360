import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Send, Phone, Video, Minimize2, MessageSquare, AlertTriangle, Paperclip, Search, Play } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import FileAttachment from './FileAttachment';
import VoiceRecorder from './VoiceRecorder';
import EmojiPicker from './EmojiPicker';
import MessageItem from './MessageItem';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  author: string;
  sender_id: string;
  recipient_id?: string;
  conversation_id?: string;
  created_at: string;
  edited_at?: string;
  deleted_at?: string;
  message_type?: string;
  platform: string;
  is_read?: boolean;
  read_at?: string;
  attachments?: any;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  voice_duration?: number;
}

interface ChatWindowProps {
  contactId: string;
  contactName: string;
  contactOrganization?: string;
  onClose: () => void;
  onMinimize?: () => void;
  onStartCall: () => void;
  onStartVideoCall: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  contactId, 
  contactName,
  contactOrganization,
  onClose, 
  onMinimize,
  onStartCall, 
  onStartVideoCall 
}) => {
  const { user } = useAuth();
  const isCrossOrganization = contactOrganization && user?.organization && contactOrganization !== user.organization;
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [contactIsTyping, setContactIsTyping] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<{ blob: Blob; transcription: string; duration: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

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
            prev.map(m => (m.id === msg.client_id ? { ...data, author: data.sender_id, platform: 'facesheet360' } : m))
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

  // Filter messages based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMessages(messages);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = messages.filter(
        (msg) =>
          msg.content.toLowerCase().includes(query) ||
          msg.author.toLowerCase().includes(query)
      );
      setFilteredMessages(filtered);
    }
  }, [messages, searchQuery]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!searchQuery) {
      scrollToBottom();
    }
  }, [filteredMessages, searchQuery]);

  // Load messages for this conversation
  useEffect(() => {
    const loadMessages = async () => {
      if (!user?.id || !contactId) return;
      
      setLoading(true);
      // Temporarily disable chat as conversations table doesn't exist in new backend
      toast.info('Chat functionality temporarily disabled during backend migration');
      setMessages([]);
      setConversationId(null);
      setLoading(false);
    };

    loadMessages();
  }, [user?.id, contactId]);

  // Real-time message subscription and typing indicators
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    const channel = supabase
      .channel(`conversation:${conversationId}`)
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
            if (prev.find(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });

          // Mark as read if we're the recipient
          if (newMessage.recipient_id === user.id) {
            markMessageAsRead(newMessage.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages(prev =>
            prev.map(msg => (msg.id === updatedMessage.id ? updatedMessage : msg))
          );
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const contactPresence = presenceState[contactId];
        if (contactPresence && contactPresence.length > 0) {
          const state = contactPresence[0] as any;
          setContactIsTyping(state?.typing === true);
        } else {
          setContactIsTyping(false);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, typing: false });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id, contactId]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!conversationId || !user?.id) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (!isTyping) {
      setIsTyping(true);
      const channel = supabase.channel(`conversation:${conversationId}`);
      channel.track({ user_id: user.id, typing: true });
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      const channel = supabase.channel(`conversation:${conversationId}`);
      channel.track({ user_id: user.id, typing: false });
    }, 1000);
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload images, PDFs, or Word documents.');
      return;
    }

    setSelectedFile(file);
  };

  const uploadFile = async (file: File): Promise<{ fileUrl: string; fileName: string; fileType: string; fileSize: number } | null> => {
    try {
      setUploadingFile(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      return {
        fileUrl: fileName,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const handleVoiceRecorded = async (blob: Blob, transcription: string, duration: number) => {
    setVoiceBlob({ blob, transcription, duration });
  };

  const handleSendMessage = async () => {
    // Temporarily disable chat as conversations table doesn't exist
    toast.info('Chat functionality temporarily disabled during backend migration');
    setNewMessage('');
    setSelectedFile(null);
    setVoiceBlob(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else {
      handleTyping();
    }
  };

  const refreshMessages = () => {
    // Chat disabled
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
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-3 w-3" />
            </Button>
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
      
      {showSearch && (
        <div className="px-3 pt-2">
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm"
          />
        </div>
      )}
      
      {isCrossOrganization && (
        <Alert variant="destructive" className="mx-3 mt-2 mb-0 border-warning bg-warning/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Cross-Organization Communication:</strong> You are communicating with a provider from a different organization ({contactOrganization}). Ensure proper consent and HIPAA compliance before sharing patient information.
          </AlertDescription>
        </Alert>
      )}
      
      <CardContent className="p-0 flex flex-col h-80">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm text-center">
                {searchQuery ? 'No messages found' : `Start your conversation with ${contactName}`}
              </p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div key={message.id} className="p-2 border-b">
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
          {contactIsTyping && (
            <div className="flex justify-start">
              <div className="bg-muted px-3 py-2 rounded-lg">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className="p-3 border-t bg-muted/30">
          {selectedFile && (
            <div className="mb-2">
              <FileAttachment
                fileUrl=""
                fileName={selectedFile.name}
                fileType={selectedFile.type}
                fileSize={selectedFile.size}
                onRemove={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                isPreview
              />
            </div>
          )}
          {voiceBlob && (
            <div className="mb-2 p-2 rounded bg-muted border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Voice message ready</p>
                    <p className="text-xs text-muted-foreground">{voiceBlob.duration}s - "{voiceBlob.transcription}"</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setVoiceBlob(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile || !conversationId || !!voiceBlob}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <VoiceRecorder
              onVoiceRecorded={handleVoiceRecorded}
              disabled={!conversationId || !!selectedFile || !!voiceBlob}
            />
            <EmojiPicker onEmojiSelect={(emoji) => setNewMessage(prev => prev + emoji)} />
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 text-sm"
              disabled={uploadingFile || !!voiceBlob}
            />
            <Button 
              onClick={handleSendMessage}
              size="sm" 
              disabled={(!newMessage.trim() && !selectedFile && !voiceBlob) || uploadingFile}
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