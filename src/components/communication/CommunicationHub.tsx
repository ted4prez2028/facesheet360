import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCommunication, User } from '@/hooks/useCommunication';
import { useLocation } from 'react-router-dom';
import ChatManager from './ChatManager';

export const CommunicationHub = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { users, conversations, loading, fetchUsers } = useCommunication();
  const location = useLocation();
  
  const isHomePage = location.pathname === '/';
  
  useEffect(() => {
    if (isOpen && !isHomePage) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers, isHomePage]);
  
  if (isHomePage) {
    return null;
  }
  
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const onlineUsers = filteredUsers.filter(u => u.online_status);
  
  const groupedByRole = filteredUsers.reduce((acc, user) => {
    const role = user.role || 'Other';
    if (!acc[role]) acc[role] = [];
    acc[role].push(user);
    return acc;
  }, {} as Record<string, User[]>);
  
  return (
    <ChatManager>
      {(openChat) => (
        <>
          <Button 
            variant="outline" 
            size="icon" 
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground border-0 z-40"
            onClick={() => setIsOpen(true)}
          >
            <Users className="h-6 w-6" />
          </Button>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="sm:max-w-md w-full">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Provider Communication
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                <Input
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="online">
                      Online {onlineUsers.length > 0 && <Badge variant="secondary" className="ml-1">{onlineUsers.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="role">By Role</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-4">
                    <ScrollArea className="h-[calc(100vh-280px)]">
                      {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No providers found</div>
                      ) : (
                        <div className="space-y-2">
                          {filteredUsers.map((user) => (
                            <UserCard 
                              key={user.id} 
                              user={user} 
                              conversation={conversations[user.id]}
                              onChat={openChat}
                              onClose={() => setIsOpen(false)}
                            />
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="online" className="mt-4">
                    <ScrollArea className="h-[calc(100vh-280px)]">
                      {onlineUsers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No online providers</div>
                      ) : (
                        <div className="space-y-2">
                          {onlineUsers.map((user) => (
                            <UserCard 
                              key={user.id} 
                              user={user} 
                              conversation={conversations[user.id]}
                              onChat={openChat}
                              onClose={() => setIsOpen(false)}
                            />
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="role" className="mt-4">
                    <ScrollArea className="h-[calc(100vh-280px)]">
                      {Object.entries(groupedByRole).map(([role, roleUsers]) => (
                        <div key={role} className="mb-4">
                          <h3 className="font-medium text-sm text-muted-foreground mb-2 uppercase">{role}</h3>
                          <div className="space-y-2">
                            {roleUsers.map((user) => (
                              <UserCard 
                                key={user.id} 
                                user={user} 
                                conversation={conversations[user.id]}
                                onChat={openChat}
                                onClose={() => setIsOpen(false)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}
    </ChatManager>
  );
};

interface UserCardProps {
  user: User;
  conversation: any;
  onChat: (contactId: string, contactName: string) => void;
}

interface UserCardProps {
  user: User;
  conversation: any;
  onChat: (contactId: string, contactName: string) => void;
  onClose: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, conversation, onChat, onClose }) => {
  const hasUnread = conversation?.last_message && !conversation.last_message.is_read;
  
  const handleClick = () => {
    onChat(user.id, user.name);
    onClose();
  };
  
  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
      onClick={handleClick}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {user.name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        {user.online_status && (
          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{user.name}</p>
          {hasUnread && (
            <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
              !
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {user.role} {user.specialty && `• ${user.specialty}`}
        </p>
        {conversation?.last_message && (
          <p className="text-xs text-muted-foreground truncate mt-1">
            {conversation.last_message.content}
          </p>
        )}
      </div>
    </div>
  );
};

export default CommunicationHub;
