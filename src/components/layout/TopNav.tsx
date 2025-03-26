import React, { useState, useEffect, useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Home, Users, Calendar, BarChart, Settings, CreditCard } from 'lucide-react';
import { Badge } from "@/components/ui/badge"
import { useCommunication } from '@/context/CommunicationContext';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '@/lib/supabaseApi';

interface Notification {
  id: string;
  created_at: string;
  type: string;
  message: string;
  read: boolean;
  user_id: string;
}

const TopNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const communication = useCommunication();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationSoundRef = useRef<HTMLAudioElement>(null);

  const { data: initialNotifications, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
  });

  useEffect(() => {
    if (initialNotifications) {
      setNotifications(initialNotifications);
    }
  }, [initialNotifications]);

  useEffect(() => {
    const handleRealtimeNotification = (payload: any) => {
      if (payload.new && payload.new.type === 'broadcast') {
        const notification = payload.new as unknown as Notification;
        setNotifications((prev) => [...prev, notification]);
        if (notificationSoundRef.current) {
          notificationSoundRef.current.play().catch(console.error);
        }
      }
    };

    const channel = (window as any).supabase.channel('public:notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, handleRealtimeNotification)
      .subscribe()

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      if (communication && typeof communication.setCallActive === 'function') {
        communication.setCallActive(false);
      }
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
    setNotifications(updatedNotifications);
  
    try {
      const { error } = await (window as any).supabase.functions.invoke('mark-all-notifications-as-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (error) {
        throw error;
      }
  
      await refetch();
      toast.success('All notifications marked as read!');
    } catch (error: any) {
      console.error('Error marking notifications as read:', error);
      toast.error(error.message || 'Failed to mark notifications as read.');
  
      setNotifications(notifications);
    }
  };

  const unreadCount = notifications?.filter(notification => !notification.read).length;

  return (
    <div className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/dashboard" className="font-bold text-xl">CareConnect</Link>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/patients">
              <Users className="mr-2 h-4 w-4" />
              <span>Patients</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/appointments">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Appointments</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/analytics">
              <BarChart className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/subscription">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Subscription</span>
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 rounded-full px-2 py-0.5 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
                <span className="sr-only">Toggle notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications?.length === 0 ? (
                <DropdownMenuItem className="cursor-default">
                  No notifications
                </DropdownMenuItem>
              ) : (
                <>
                  {notifications?.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="break-words">
                      <div className="flex justify-between">
                        <div className="truncate">{notification.message}</div>
                        {!notification.read && (
                          <Badge className="ml-2">New</Badge>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={markAllAsRead}>
                    Mark all as read
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.profileImage}
                      alt={user.name || 'User'}
                    />
                    <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/subscription">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Subscription</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <audio ref={notificationSoundRef} src="/sounds/notification.mp3" preload="auto" />
    </div>
  );
};

export default TopNav;
