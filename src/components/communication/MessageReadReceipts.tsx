import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, CheckCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface MessageReadReceiptsProps {
  messageId: string;
  groupId: string;
  totalParticipants: number;
}

interface ReadReceipt {
  user_id: string;
  read_at: string;
  user_name?: string;
  avatar_url?: string;
}

export const MessageReadReceipts: React.FC<MessageReadReceiptsProps> = ({
  messageId,
  groupId,
  totalParticipants
}) => {
  const [readReceipts, setReadReceipts] = useState<ReadReceipt[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReadReceipts();

    // Subscribe to new read receipts
    const channel = supabase
      .channel(`read-receipts:${messageId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_message_reads',
          filter: `message_id=eq.${messageId}`
        },
        async (payload) => {
          const newRead = payload.new as any;
          // Fetch user info
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', newRead.user_id)
            .single();

          setReadReceipts(prev => [
            ...prev,
            {
              user_id: newRead.user_id,
              read_at: newRead.read_at,
              user_name: profile?.name || 'Unknown',
              avatar_url: undefined
            }
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId]);

  const fetchReadReceipts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('group_message_reads')
        .select(`
          user_id,
          read_at,
          profiles!group_message_reads_user_id_fkey(name)
        `)
        .eq('message_id', messageId)
        .order('read_at', { ascending: true });

      if (error) throw error;

      const formattedReceipts = data?.map(r => ({
        user_id: r.user_id,
        read_at: r.read_at,
        user_name: (r.profiles as any)?.name || 'Unknown',
        avatar_url: undefined
      })) || [];

      setReadReceipts(formattedReceipts);
    } catch (error) {
      console.error('Error fetching read receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const readCount = readReceipts.length;
  const unreadCount = totalParticipants - readCount - 1; // -1 for sender

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 hover:bg-transparent"
        >
          {readCount > 0 ? (
            <CheckCheck className="h-3 w-3 text-primary" />
          ) : (
            <Check className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">
              Read by {readCount} of {totalParticipants - 1}
            </h4>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {unreadCount} haven't read yet
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : readReceipts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No one has read this message yet
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {readReceipts.map((receipt) => (
                <div
                  key={receipt.user_id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={receipt.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {receipt.user_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {receipt.user_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(receipt.read_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
