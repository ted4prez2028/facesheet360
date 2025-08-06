
import React, { useEffect, useState, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getNotifications, markNotificationAsRead, type Notification } from '@/lib/api/notificationApi';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    const data = await getNotifications(user.id);
    setNotifications(data);
  }, [user]);
  
  const handleRead = useCallback(async (notificationId: string) => {
    if (!user) return;
    
    try {
      await markNotificationAsRead(notificationId);
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user]);
  
  useEffect(() => {
    if (!user) return;
    
    // Fetch notifications on initial load
    fetchNotifications();
    
    // Set up a listener for new notifications
    const channel = supabase.channel('user-notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchNotifications();
      })
      .subscribe();
    
    // Refresh notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000);
    
    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);
  
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'pharmacy':
        return <span className="text-blue-500">💊</span>;
      case 'appointment':
        return <span className="text-green-500">📅</span>;
      case 'patient':
        return <span className="text-orange-500">👤</span>;
      case 'wound_care':
        return <span className="text-red-500">🩹</span>;
      case 'carecoin':
        return <span className="text-yellow-500">🪙</span>;
      case 'food_delivery':
        return <span className="text-purple-500">🍽️</span>;
      default:
        return <span className="text-gray-500">📢</span>;
    }
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="font-medium p-3 border-b">
          Notifications
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                  onClick={() => handleRead(notification.id)}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-muted-foreground">{notification.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
