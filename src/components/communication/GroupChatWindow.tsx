import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, Send, Minimize2, Users, Paperclip, Play, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import FileAttachment from './FileAttachment';
import VoiceRecorder from './VoiceRecorder';
import { toast } from 'sonner';

interface GroupMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  voice_duration?: number;
  sender_name?: string;
  sender_role?: string;
}

interface Participant {
  id: string;
  user_id: string;
  role: string;
  name?: string;
  avatar_url?: string;
}

interface GroupChatWindowProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
  onMinimize?: () => void;
}

const GroupChatWindow: React.FC<GroupChatWindowProps> = ({
  groupId,
  groupName,
  onClose,
  onMinimize
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [voiceBlob, setVoiceBlob] = useState<{ blob: Blob; transcription: string; duration: number } | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load participants
  useEffect(() => {
    const loadParticipants = async () => {
      try {
        const { data, error } = await supabase
          .from('group_participants')
          .select(`
            id,
            user_id,
            role,
            profiles!group_participants_user_id_fkey(name, avatar_url)
          `)
          .eq('group_id', groupId);

        if (error) throw error;

        const formattedParticipants = data?.map(p => ({
          id: p.id,
          user_id: p.user_id,
          role: p.role,
          name: (p.profiles as any)?.name || 'Unknown',
          avatar_url: (p.profiles as any)?.avatar_url
        })) || [];

        setParticipants(formattedParticipants);
      } catch (error) {
        console.error('Error loading participants:', error);
      }
    };

    loadParticipants();
  }, [groupId]);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('group_messages')
          .select(`
            *,
            profiles!group_messages_sender_id_fkey(name, role)
          `)
          .eq('group_id', groupId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formattedMessages = data?.map(msg => ({
          ...msg,
          sender_name: (msg.profiles as any)?.name || 'Unknown',
          sender_role: (msg.profiles as any)?.role
        })) || [];

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [groupId]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`group:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        async (payload) => {
          const newMsg = payload.new as any;
          
          // Fetch sender info
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', newMsg.sender_id)
            .single();

          const formattedMsg = {
            ...newMsg,
            sender_name: profile?.name || 'Unknown',
            sender_role: profile?.role
          };

          setMessages(prev => {
            if (prev.find(msg => msg.id === formattedMsg.id)) {
              return prev;
            }
            return [...prev, formattedMsg];
          });

          // Mark as read
          if (newMsg.sender_id !== user?.id) {
            await markMessageAsRead(newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, user?.id]);

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('group_message_reads')
        .insert({
          message_id: messageId,
          user_id: user?.id
        });
    } catch (error) {
      // Ignore duplicate errors
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file);

      if (error) throw error;

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
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile && !voiceBlob) || !user?.id) return;

    let fileData = null;
    if (selectedFile) {
      fileData = await uploadFile(selectedFile);
      if (!fileData) return;
    } else if (voiceBlob) {
      fileData = await uploadFile(new File([voiceBlob.blob], 'voice-message.webm', { type: 'audio/webm' }));
      if (!fileData) return;
    }

    const messageData = {
      content: newMessage.trim() || (voiceBlob ? voiceBlob.transcription : selectedFile ? `Sent ${selectedFile.name}` : ''),
      group_id: groupId,
      sender_id: user.id,
      created_at: new Date().toISOString(),
      ...(fileData && {
        file_url: fileData.fileUrl,
        file_name: fileData.fileName,
        file_type: fileData.fileType,
        file_size: fileData.fileSize
      }),
      ...(voiceBlob && {
        voice_duration: voiceBlob.duration
      })
    };

    setNewMessage('');
    setSelectedFile(null);
    setVoiceBlob(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      const { error } = await supabase
        .from('group_messages')
        .insert([messageData]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="w-96 h-[500px] shadow-lg bg-background border flex flex-col">
      <CardHeader className="pb-2 px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
              <AvatarFallback>
                <Users className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium truncate">{groupName}</CardTitle>
              <p className="text-xs text-muted-foreground">{participants.length} members</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <Settings className="h-3 w-3" />
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

      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        {showParticipants ? (
          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium mb-3">Participants</h4>
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={participant.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {participant.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm flex-1">{participant.name}</span>
                  {participant.role === 'admin' && (
                    <Badge variant="secondary" className="text-xs">Admin</Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4 py-3">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Users className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm text-center">Start the group conversation</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map(message => (
                    <div key={message.id} className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-medium">
                          {message.sender_id === user?.id ? 'You' : message.sender_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                      <div className={`inline-block max-w-[85%] px-3 py-2 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        {message.file_url && message.file_type?.startsWith('audio/') ? (
                          <div className="flex items-center gap-2 p-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Play className="h-4 w-4" />
                            </Button>
                            <div>
                              <p className="text-xs">Voice Message</p>
                              <p className="text-xs opacity-70">{message.voice_duration}s</p>
                            </div>
                          </div>
                        ) : message.file_url ? (
                          <FileAttachment
                            fileUrl={message.file_url}
                            fileName={message.file_name || 'file'}
                            fileType={message.file_type || 'application/octet-stream'}
                            fileSize={message.file_size || 0}
                          />
                        ) : null}
                        {message.content && !message.file_type?.startsWith('audio/') && (
                          <p className="text-sm break-words">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

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
                        <p className="text-xs text-muted-foreground">{voiceBlob.duration}s</p>
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
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!!voiceBlob}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <VoiceRecorder
                  onVoiceRecorded={(blob, transcription, duration) =>
                    setVoiceBlob({ blob, transcription, duration })
                  }
                  disabled={!!selectedFile || !!voiceBlob}
                />
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 text-sm"
                  disabled={!!voiceBlob}
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  disabled={!newMessage.trim() && !selectedFile && !voiceBlob}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupChatWindow;
