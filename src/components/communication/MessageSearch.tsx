import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface SearchResult {
  id: string;
  content: string;
  created_at: string | null;
  sender_id: string;
  conversation_id: string;
  sender_name: string;
}

interface MessageSearchProps {
  onClose: () => void;
  onResultClick: (conversationId: string, messageId: string) => void;
}

const MessageSearch: React.FC<MessageSearchProps> = ({ onClose, onResultClick }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user?.id) return;

    setLoading(true);
    try {
      // Search messages where user is sender or recipient
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          conversation_id,
          profiles!messages_sender_id_fkey(name)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .ilike('content', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedResults = data?.map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at ?? '',
        sender_id: msg.sender_id,
        conversation_id: msg.conversation_id,
        sender_name: (msg.profiles as any)?.name || 'Unknown'
      })) || [];

      setResults(formattedResults);

      if (formattedResults.length === 0) {
        toast.info('No messages found');
      }
    } catch (error) {
      console.error('Error searching messages:', error);
      toast.error('Failed to search messages');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const highlightMatch = (text: string, query: string) => {
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={i} className="bg-primary/30 rounded px-0.5">{part}</mark> : 
        part
    );
  };

  return (
    <Card className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl shadow-lg z-50 bg-background border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Search Messages</CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for messages..."
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {results.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {loading ? 'Searching...' : 'Enter a search query to find messages'}
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => {
                    onResultClick(result.conversation_id, result.id);
                    onClose();
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium">{result.sender_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(result.created_at)}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2">
                    {highlightMatch(result.content, searchQuery)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default MessageSearch;
