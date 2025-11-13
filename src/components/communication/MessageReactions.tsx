import React, { useState, useEffect } from 'react';
import { Heart, ThumbsUp, Smile, PartyPopper, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface Reaction {
  id: string;
  user_id: string;
  reaction: string;
}

interface MessageReactionsProps {
  messageId: string;
  isOwnMessage: boolean;
}

const REACTION_ICONS = {
  like: ThumbsUp,
  heart: Heart,
  thumbs_up: ThumbsUp,
  celebrate: PartyPopper,
  care: Star,
};

const REACTION_LABELS = {
  like: 'Like',
  heart: 'Love',
  thumbs_up: 'Thumbs Up',
  celebrate: 'Celebrate',
  care: 'Care',
};

const MessageReactions: React.FC<MessageReactionsProps> = ({ messageId, isOwnMessage }) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReactions();
    
    // Subscribe to reaction changes
    const channel = supabase
      .channel(`message-reactions:${messageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=eq.${messageId}`
        },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId]);

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId);

      if (error) throw error;
      setReactions(data || []);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const existingReaction = reactions.find(
        r => r.user_id === user.id && r.reaction === reactionType
      );

      if (existingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            reaction: reactionType
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast.error('Failed to add reaction');
    } finally {
      setLoading(false);
    }
  };

  const groupedReactions = reactions.reduce((acc, r) => {
    if (!acc[r.reaction]) acc[r.reaction] = [];
    acc[r.reaction].push(r);
    return acc;
  }, {} as Record<string, Reaction[]>);

  const userHasReaction = (reactionType: string) => {
    return reactions.some(r => r.user_id === user?.id && r.reaction === reactionType);
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* Display existing reactions */}
      {Object.entries(groupedReactions).map(([type, reactionList]) => {
        const Icon = REACTION_ICONS[type as keyof typeof REACTION_ICONS];
        const hasReacted = userHasReaction(type);
        
        return (
          <Button
            key={type}
            variant={hasReacted ? "default" : "ghost"}
            size="sm"
            className={`h-6 px-2 gap-1 ${hasReacted ? 'bg-primary/20' : ''}`}
            onClick={() => handleReaction(type)}
            disabled={loading}
          >
            {Icon && <Icon className="h-3 w-3" />}
            <span className="text-xs">{reactionList.length}</span>
          </Button>
        );
      })}

      {/* Reaction picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={loading}
          >
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align={isOwnMessage ? "end" : "start"}>
          <div className="flex gap-1">
            {Object.entries(REACTION_ICONS).map(([type, Icon]) => (
              <Button
                key={type}
                variant={userHasReaction(type) ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleReaction(type)}
                title={REACTION_LABELS[type as keyof typeof REACTION_LABELS]}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MessageReactions;
