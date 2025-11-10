import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVertical, Edit2, Trash2, Check, X, CheckCheck, Play } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EmojiPicker from './EmojiPicker';
import FileAttachment from './FileAttachment';

interface MessageReaction {
  id: string;
  emoji: string;
  user_id: string;
  count?: number;
}

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
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  voice_duration?: number;
}

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  currentUserId: string;
  onMessageUpdated: () => void;
}

const EDIT_TIME_LIMIT = 15 * 60 * 1000; // 15 minutes

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwnMessage,
  currentUserId,
  onMessageUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const canEdit = isOwnMessage && !message.deleted_at && 
    Date.now() - new Date(message.created_at).getTime() < EDIT_TIME_LIMIT;
  const canDelete = isOwnMessage && !message.deleted_at;

  useEffect(() => {
    fetchReactions();
    
    // Subscribe to reaction changes
    const channel = supabase
      .channel(`message-reactions:${message.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=eq.${message.id}`
        },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [message.id]);

  const fetchReactions = async () => {
    const { data, error } = await supabase
      .from('message_reactions')
      .select('id, emoji, user_id')
      .eq('message_id', message.id);

    if (error) {
      console.error('Error fetching reactions:', error);
      return;
    }

    if (!data) {
      setReactions([]);
      return;
    }

    // Group reactions by emoji
    const grouped = data.reduce((acc: Record<string, MessageReaction>, reaction: any) => {
      const emoji = reaction.emoji;
      if (!acc[emoji]) {
        acc[emoji] = {
          id: reaction.id,
          emoji: emoji,
          user_id: reaction.user_id,
          count: 0,
        };
      }
      acc[emoji].count = (acc[emoji].count || 0) + 1;
      return acc;
    }, {});

    setReactions(Object.values(grouped));
  };

  const handleEdit = async () => {
    if (!editedContent.trim()) return;

    const { error } = await supabase
      .from('messages')
      .update({
        content: editedContent,
        edited_at: new Date().toISOString(),
      })
      .eq('id', message.id);

    if (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
      return;
    }

    setIsEditing(false);
    onMessageUpdated();
    toast.success('Message edited');
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from('messages')
      .update({
        deleted_at: new Date().toISOString(),
        content: 'This message was deleted',
      })
      .eq('id', message.id);

    if (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
      return;
    }

    onMessageUpdated();
    toast.success('Message deleted');
  };

  const handleAddReaction = async (emoji: string) => {
    try {
      const { error } = await supabase
        .from('message_reactions')
        .insert([{
          message_id: message.id,
          user_id: currentUserId,
          emoji,
        }] as any);

      if (error) {
        if (error.code === '23505') {
          // Already reacted with this emoji, remove it
          await (supabase
            .from('message_reactions')
            .delete() as any)
            .eq('message_id', message.id)
            .eq('user_id', currentUserId)
            .eq('emoji', emoji);
        } else {
          console.error('Error adding reaction:', error);
          toast.error('Failed to add reaction');
        }
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }

    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (message.deleted_at) {
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-[80%] px-3 py-2 rounded-lg bg-muted/50">
          <p className="text-sm italic text-muted-foreground">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}>
      <div className="max-w-[80%]">
        <div
          className={`px-3 py-2 rounded-lg ${
            isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          {isEditing ? (
            <div className="flex gap-2 items-center">
              <Input
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleEdit();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                className="text-sm"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleEdit}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              {message.file_url && message.file_type?.startsWith('audio/') ? (
                <div className="mb-2">
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Play className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <p className="text-xs font-medium">Voice Message</p>
                      <p className="text-xs text-muted-foreground">
                        {message.voice_duration ? `${message.voice_duration}s` : 'Audio'}
                      </p>
                    </div>
                  </div>
                  {message.content && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{message.content}"
                    </p>
                  )}
                </div>
              ) : message.file_url ? (
                <div className="mb-2">
                  <FileAttachment
                    fileUrl={message.file_url}
                    fileName={message.file_name || 'file'}
                    fileType={message.file_type || 'application/octet-stream'}
                    fileSize={message.file_size || 0}
                  />
                </div>
              ) : null}
              {message.content && !message.file_type?.startsWith('audio/') && (
                <p className="text-sm break-words">{message.content}</p>
              )}
            </>
          )}
          
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex items-center gap-1">
              <p className="text-xs opacity-70">{formatTime(message.created_at)}</p>
              {message.edited_at && (
                <p className="text-xs opacity-50 italic">(edited)</p>
              )}
              {isOwnMessage && (
                <span className="text-xs opacity-70">
                  {message.is_read ? (
                    <CheckCheck className="h-3 w-3 inline" />
                  ) : (
                    <Check className="h-3 w-3 inline" />
                  )}
                </span>
              )}
            </div>
            
            {!isEditing && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <EmojiPicker
                  onEmojiSelect={handleAddReaction}
                  trigger={
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <span className="text-xs">😊</span>
                    </Button>
                  }
                />
                {(canEdit || canDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canEdit && (
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </div>
        </div>
        
        {reactions.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {reactions.map((reaction) => (
              <Button
                key={reaction.id}
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handleAddReaction(reaction.emoji)}
              >
                {reaction.emoji} {reaction.count}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
