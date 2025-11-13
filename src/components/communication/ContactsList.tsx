
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
  PhoneCall
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useLocation } from 'react-router-dom';

const ContactsList = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  
  // Hide on homepage
  const isHomePage = location.pathname === '/';
  
  if (isHomePage) {
    return null;
  }
  
  const toggleContacts = () => {
    setIsOpen(!isOpen);
  };
  
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
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Healthcare Team</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            
            <div className="h-[calc(100vh-240px)] overflow-y-auto pr-2">
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Users className="h-8 w-8 mb-2" />
                <p>No contacts available</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ContactsList;
