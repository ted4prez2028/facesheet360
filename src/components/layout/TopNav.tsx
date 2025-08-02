
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { 
  MessageSquare, 
  Settings, 
  User,
  ChevronDown,
  DollarSign,
  Pill,
  LogOut
} from 'lucide-react';
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCommunication } from '@/context/communication/CommunicationContext';
import NotificationCenter from '@/components/notifications/NotificationCenter';

const TopNav: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleContacts } = useCommunication();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/"); // Redirect to homepage after logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "?";

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <SidebarTrigger className="mr-2" />
        <Link to="/" className="font-bold text-xl text-health-600">Facesheet360</Link>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Notification Center */}
        <NotificationCenter />

        <Button 
          variant="outline" 
          size="icon"
          onClick={toggleContacts}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-2 pl-2 pr-1 py-1 h-9">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={user?.profile_image} />
                <AvatarFallback className="bg-health-600 text-white text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="mr-1">{user?.name?.split(' ')[0]}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/subscription')}>
                <DollarSign className="mr-2 h-4 w-4" />
                <span>Subscription</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/pharmacy')}>
                <Pill className="mr-2 h-4 w-4" />
                <span>Pharmacy Dashboard</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopNav;
