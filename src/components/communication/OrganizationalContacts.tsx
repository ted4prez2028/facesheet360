import React, { useState, useEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  Users,
  MessageSquare, 
  Video, 
  PhoneCall,
  Search,
  CircleIcon
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ChatManager from './ChatManager';

interface OrganizationalUser {
  id: string;
  name: string;
  email: string;
  role: string;
  online_status: boolean;
  specialty?: string;
  organization?: string;
}

interface MessagePreview {
  id: string;
  content: string;
  created_at: string;
  author: string;
  user_id: string;
}

const OrganizationalContacts = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<OrganizationalUser[]>([]);
  const [messageHistory, setMessageHistory] = useState<Record<string, MessagePreview | null>>({});
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  // Hide on homepage
  const isHomePage = location.pathname === '/';
  
  if (isHomePage) {
    return null;
  }

  // Fetch organizational users
  useEffect(() => {
    const fetchOrganizationalUsers = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get current user's organization
        const { data: currentUserData } = await supabase
          .from('users')
          .select('organization')
          .eq('user_id', user.id)
          .single();

        if (!currentUserData?.organization) {
          setLoading(false);
          return;
        }

        // Fetch all users in the same organization
        const { data: orgUsers, error } = await supabase
          .from('users')
          .select('id, name, email, role, online_status, specialty, organization')
          .eq('organization', currentUserData.organization)
          .neq('user_id', user.id); // Exclude current user

        if (error) {
          console.error('Error fetching organizational users:', error);
          return;
        }

        setUsers(orgUsers || []);
        
        // Fetch message history for each user
        if (orgUsers && orgUsers.length > 0) {
          await fetchMessageHistory(orgUsers);
        }
      } catch (error) {
        console.error('Error fetching organizational users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchOrganizationalUsers();
    }
  }, [isOpen, user]);

  const fetchMessageHistory = async (orgUsers: OrganizationalUser[]) => {
    if (!user?.id) return;

    const history: Record<string, MessagePreview | null> = {};
    
    for (const contact of orgUsers) {
      try {
        // Since messages table doesn't have recipient_id, we'll fetch recent messages from this contact
        // In a real implementation, you'd want to add conversation/thread support
        const { data: messages, error } = await supabase
          .from('messages')
          .select('id, content, created_at, author, user_id')
          .eq('user_id', contact.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching message history for', contact.name, error);
          history[contact.id] = null;
          continue;
        }

        history[contact.id] = messages && messages.length > 0 ? messages[0] : null;
      } catch (error) {
        console.error('Error fetching message history for', contact.name, error);
        history[contact.id] = null;
      }
    }
    
    setMessageHistory(history);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleContacts = () => {
    setIsOpen(!isOpen);
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'nurse':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'pharmacist':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatMessagePreview = (content: string, maxLength: number = 40) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <ChatManager>
      {(openChat) => (
        <>
          <Button 
            variant="outline" 
            size="icon" 
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white border-0 z-40"
            onClick={toggleContacts}
          >
            <Users className="h-6 w-6" />
          </Button>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Communication
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="h-[calc(100vh-240px)] overflow-y-auto pr-2">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="mt-2">Loading team members...</p>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                      <Users className="h-12 w-12 mb-2 opacity-50" />
                      <p className="text-center">
                        {searchTerm ? 'No team members found' : 'No team members available'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredUsers.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src="" alt={contact.name || 'User'} />
                                <AvatarFallback className="text-sm">
                                  {contact.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <CircleIcon 
                                className={`absolute -bottom-1 -right-1 h-4 w-4 ${
                                  contact.online_status 
                                    ? 'text-green-500 fill-green-500' 
                                    : 'text-gray-400 fill-gray-400'
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm truncate">
                                  {contact.name || 'Unknown User'}
                                </h4>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${getRoleColor(contact.role)}`}
                                >
                                  {contact.role || 'User'}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground truncate">
                                  {contact.email}
                                </p>
                                {contact.specialty && (
                                  <p className="text-xs text-muted-foreground">
                                    {contact.specialty}
                                  </p>
                                )}
                                {/* Message preview */}
                                <div className="mt-1">
                                  {messageHistory[contact.id] ? (
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs text-muted-foreground truncate flex-1">
                                        {messageHistory[contact.id]!.user_id === user?.id ? 'You: ' : ''}
                                        {formatMessagePreview(messageHistory[contact.id]!.content)}
                                      </p>
                                      <span className="text-xs text-muted-foreground ml-2">
                                        {formatTime(messageHistory[contact.id]!.created_at)}
                                      </span>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic">
                                      No messages yet
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => {
                                openChat(contact.id, contact.name || 'Unknown User');
                                setIsOpen(false);
                              }}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => console.log('Starting call with:', contact.id, contact.name)}
                            >
                              <PhoneCall className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => console.log('Starting video call with:', contact.id, contact.name)}
                            >
                              <Video className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}
    </ChatManager>
  );
};

export default OrganizationalContacts;