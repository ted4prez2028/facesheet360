import React, { useState } from 'react';
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
  CircleIcon,
  X,
  Minimize2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'react-router-dom';
import { useOrganizationalCommunication } from '@/hooks/useOrganizationalCommunication';
import ChatWindow from './ChatWindow';
import VideoCallInterface from './VideoCallInterface';

interface ChatSession {
  id: string;
  contactId: string;
  contactName: string;
  isMinimized: boolean;
}

const CommunicationHub = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeVideoCall, setActiveVideoCall] = useState<{contactId: string, contactName: string} | null>(null);
  const location = useLocation();
  const { users, conversations, loading, error, fetchOrganizationalUsers } = useOrganizationalCommunication();
  
  // Hide on homepage
  const isHomePage = location.pathname === '/';
  
  if (isHomePage) {
    return null;
  }

  // Fetch data when modal opens
  const handleToggleContacts = () => {
    if (!isOpen) {
      fetchOrganizationalUsers();
    }
    setIsOpen(!isOpen);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openChat = (contactId: string, contactName: string) => {
    // Check if chat is already open
    const existingChat = chatSessions.find(chat => chat.contactId === contactId);
    if (existingChat) {
      // Un-minimize if it was minimized
      setChatSessions(prev => prev.map(chat => 
        chat.contactId === contactId 
          ? { ...chat, isMinimized: false }
          : chat
      ));
      return;
    }

    // Create new chat session
    const newChat: ChatSession = {
      id: `chat-${contactId}-${Date.now()}`,
      contactId,
      contactName,
      isMinimized: false
    };

    setChatSessions(prev => [...prev, newChat]);
    setIsOpen(false); // Close contacts list when opening chat
  };

  const closeChat = (chatId: string) => {
    setChatSessions(prev => prev.filter(chat => chat.id !== chatId));
  };

  const minimizeChat = (chatId: string) => {
    setChatSessions(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, isMinimized: true }
        : chat
    ));
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

  const handleStartCall = (contactId: string, contactName: string) => {
    setActiveVideoCall({ contactId, contactName });
  };

  const handleStartVideoCall = (contactId: string, contactName: string) => {
    setActiveVideoCall({ contactId, contactName });
  };

  return (
    <>
      {/* Communication Hub Button */}
      <Button 
        variant="outline" 
        size="icon" 
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white border-0 z-40"
        onClick={handleToggleContacts}
      >
        <Users className="h-6 w-6" />
      </Button>
      
      {/* Active Chat Sessions Indicators */}
      {chatSessions.filter(chat => chat.isMinimized).length > 0 && (
        <div className="fixed bottom-20 right-6 z-30 space-y-2">
          {chatSessions.filter(chat => chat.isMinimized).map((chat) => (
            <Button
              key={chat.id}
              variant="outline"
              size="sm"
              className="h-8 px-3 bg-background border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => setChatSessions(prev => prev.map(c => 
                c.id === chat.id ? { ...c, isMinimized: false } : c
              ))}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              {chat.contactName.split(' ')[0]}
            </Button>
          ))}
        </div>
      )}
      
      {/* Contacts List Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Communication
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
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Users className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-center text-red-500">{error}</p>
                  <Button variant="ghost" size="sm" onClick={fetchOrganizationalUsers} className="mt-2">
                    Try Again
                  </Button>
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
                    <Card 
                      key={contact.id}
                      className="cursor-pointer transition-all hover:shadow-md border-l-4 border-l-primary/20 hover:border-l-primary"
                      onClick={() => openChat(contact.id, contact.name || 'Unknown User')}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
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
                                  {conversations[contact.id]?.last_message ? (
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs text-muted-foreground truncate flex-1">
                                        {conversations[contact.id].last_message!.sender_id === contact.id ? 
                                          `${contact.name?.split(' ')[0]}: ` : 'You: '}
                                        {formatMessagePreview(conversations[contact.id].last_message!.content)}
                                      </p>
                                      <span className="text-xs text-muted-foreground ml-2">
                                        {formatTime(conversations[contact.id].last_message!.created_at)}
                                      </span>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic">
                                      No messages yet - Click to start conversation
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-1 ml-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartCall(contact.id, contact.name || 'Unknown User');
                              }}
                            >
                              <PhoneCall className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartVideoCall(contact.id, contact.name || 'Unknown User');
                              }}
                            >
                              <Video className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Render active chat windows */}
      {chatSessions.filter(chat => !chat.isMinimized).map((chat, index) => (
        <div
          key={chat.id}
          style={{
            position: 'fixed',
            bottom: '1rem',
            right: `${140 + (index * 330)}px`,
            zIndex: 35
          }}
        >
          <ChatWindow
            contactId={chat.contactId}
            contactName={chat.contactName}
            onClose={() => closeChat(chat.id)}
            onMinimize={() => minimizeChat(chat.id)}
            onStartCall={() => handleStartCall(chat.contactId, chat.contactName)}
            onStartVideoCall={() => handleStartVideoCall(chat.contactId, chat.contactName)}
          />
        </div>
      ))}
      
      {/* Video Call Interface */}
      {activeVideoCall && (
        <VideoCallInterface
          contactId={activeVideoCall.contactId}
          contactName={activeVideoCall.contactName}
          onClose={() => setActiveVideoCall(null)}
        />
      )}
    </>
  );
};

export default CommunicationHub;