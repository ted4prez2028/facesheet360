
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
  Circle,
  Building,
  UserPlus
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCommunication } from '@/context/communication/CommunicationContext';
import { Input } from '@/components/ui/input';
import { User } from '@/types/index';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from 'react-router-dom';
import GroupCallModal from './GroupCallModal';

const ContactsList = () => {
  const { user } = useAuth();
  const { 
    contacts,
    toggleContacts,
    openChatWindow,
    startCall,
    isGroupCallModalOpen,
    openGroupCallModal,
    closeGroupCallModal
  } = useCommunication();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const location = useLocation();
  
  // Hide on homepage
  const isHomePage = location.pathname === '/';
  
  // Get unique organizations from users
  const organizations = ['all', ...new Set(
    contacts.onlineUsers
      .map(user => (user.organization as string) || 'No Organization')
      .filter(Boolean)
  )];
  
  const filteredUsers = contacts.onlineUsers.filter(contact => {
    const matchesSearch = 
      (contact.name as string).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.role as string).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOrganization = 
      organizationFilter === 'all' || 
      contact.organization === organizationFilter ||
      (organizationFilter === 'No Organization' && !contact.organization);
    
    // Only show contacts with the same organization as the user
    const sameOrganization = 
      !user?.organization || 
      user.organization === contact.organization || 
      organizationFilter !== 'all';
    
    return matchesSearch && matchesOrganization && sameOrganization;
  });
  
  if (isHomePage) {
    return null; // Don't render on homepage
  }
  
  return (
    <>
      <Button 
        variant="outline" 
        size="icon" 
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-health-600 hover:bg-health-700 text-white border-0 z-40"
        onClick={toggleContacts}
      >
        <Users className="h-6 w-6" />
      </Button>
      
      <Sheet open={contacts.isOpen} onOpenChange={toggleContacts}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <div className="flex justify-between items-center">
              <SheetTitle>Healthcare Team</SheetTitle>
              <Button
                onClick={openGroupCallModal}
                variant="outline"
                size="sm"
                className="flex gap-1 items-center"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Group Call
              </Button>
            </div>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              
              <Select 
                value={organizationFilter} 
                onValueChange={setOrganizationFilter}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by organization" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {organizations.map(org => (
                    <SelectItem key={org} value={org}>
                      {org === 'all' ? 'All Organizations' : org}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="h-[calc(100vh-240px)] overflow-y-auto pr-2">
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Users className="h-8 w-8 mb-2" />
                  <p>{searchTerm ? "No contacts match your search" : "No contacts available"}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((contact) => {
                    const isOnline = contact.online_status === true;
                    const contactId = String(contact.id || '');
                    const contactName = String(contact.name || 'Unknown');
                    
                    return (
                      <ContactCard 
                        key={contactId} 
                        user={contact}
                        isOnline={isOnline}
                        onChat={() => openChatWindow(contactId, contactName)}
                        onVideoCall={() => startCall(contactId, contactName, true)}
                        onAudioCall={() => startCall(contactId, contactName, false)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      <GroupCallModal 
        open={isGroupCallModalOpen} 
        onOpenChange={closeGroupCallModal} 
      />
    </>
  );
};

interface ContactCardProps {
  user: User;
  isOnline: boolean;
  onChat: () => void;
  onVideoCall: () => void;
  onAudioCall: () => void;
}

const ContactCard = ({ user, isOnline, onChat, onVideoCall, onAudioCall }: ContactCardProps) => {
  const userInitials = user.name
    ? String(user.name)
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "?";
    
  return (
    <div className="flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-3 relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.profile_image as string} />
          <AvatarFallback className="bg-health-600 text-white">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500 translate-x-1/4 translate-y-1/4" />
        )}
        <div>
          <p className="font-medium text-sm">{String(user.name)}</p>
          <div className="flex flex-col">
            <p className="text-xs text-muted-foreground capitalize">{String(user.role)}</p>
            {user.organization && (
              <p className="text-xs text-muted-foreground">{String(user.organization)}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex space-x-1">
        <Button variant="ghost" size="icon" onClick={onChat} className="h-8 w-8">
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onVideoCall} className="h-8 w-8">
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onAudioCall} className="h-8 w-8">
          <PhoneCall className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ContactsList;
