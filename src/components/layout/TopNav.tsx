
import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Notification } from "@/types";

export function TopNav() {
  const { user, logout } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    // Load notifications from database or storage
    const loadNotifications = async () => {
      // Simulated notifications for demo purposes
      // In a real app, these would come from Supabase
      const demoNotifications: Notification[] = [
        {
          id: "1",
          user_id: user?.id || "",
          title: "New patient assigned",
          description: "Patient John Doe has been assigned to you",
          time: "10 minutes ago",
          read: false,
          type: "info"
        },
        {
          id: "2",
          user_id: user?.id || "",
          title: "Medication alert",
          description: "Patient Mary Smith's prescription is expiring soon",
          time: "1 hour ago",
          read: false,
          type: "warning"
        },
        {
          id: "3",
          user_id: user?.id || "",
          title: "Appointment reminder",
          description: "You have a follow-up with Robert Johnson at 3:00 PM",
          time: "2 hours ago",
          read: false,
          type: "info"
        },
      ];
      
      setNotifications(demoNotifications);
      setNotificationCount(demoNotifications.filter(n => !n.read).length);
    };
    
    loadNotifications();
    
    // Listen for real-time notifications
    const channel = supabase.channel('notification-updates')
      .on('broadcast', { event: 'new-notification' }, payload => {
        const newNotification = payload as Notification;
        if (newNotification.user_id === user?.id) {
          setNotifications(prev => [newNotification, ...prev]);
          setNotificationCount(prev => prev + 1);
          
          // Play notification sound
          const audio = new Audio('/notification.mp3');
          audio.play().catch(err => console.log('Error playing notification sound:', err));
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "?";

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setNotificationCount(0);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="hidden md:flex md:flex-1">
          <form className="w-full max-w-sm">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patients, records..."
                className="pl-8 bg-background"
              />
            </div>
          </form>
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge 
                    className={cn(
                      "absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center",
                      "bg-health-600 text-white text-xs"
                    )}
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-medium">Notifications</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </Button>
              </div>
              <div className="max-h-80 overflow-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={cn(
                        "p-4 border-b last:border-0 transition-colors",
                        !notification.read && "bg-accent"
                      )}
                    >
                      <div className="flex justify-between gap-2">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                      <p className="text-sm mt-1">{notification.description}</p>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profile_image || "/placeholder.svg"} alt="User" />
                  <AvatarFallback className="bg-health-600 text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="flex flex-col gap-1">
                <span>{user?.name || "User"}</span>
                <span className="text-xs font-normal text-muted-foreground capitalize">
                  {user?.role === "doctor" ? "Physician" : user?.role}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Account settings</DropdownMenuItem>
              <DropdownMenuItem>CareCoins wallet</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
