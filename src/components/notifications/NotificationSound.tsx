
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell } from "lucide-react";
import { Notification } from "@/lib/api/notificationApi";

interface NotificationSoundProps {
  notifications?: Notification[];
  soundEnabled?: boolean;
}

const NotificationSound: React.FC<NotificationSoundProps> = ({
  notifications = [],
  soundEnabled = true,
}) => {
  const { toast } = useToast();
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
  const [audio] = useState<HTMLAudioElement>(new Audio("/notification.mp3"));

  useEffect(() => {
    // Check if we have notifications and if they're different from what we've seen before
    if (notifications && notifications.length > 0) {
      const latestNotification = notifications[0];
      
      // Only play sound for new notifications
      if (latestNotification.id !== lastNotificationId) {
        setLastNotificationId(latestNotification.id);
        
        // Play sound if enabled
        if (soundEnabled) {
          audio.play().catch(error => console.error("Error playing notification sound:", error));
        }
        
        // Show toast notification
        toast({
          title: latestNotification.title,
          description: latestNotification.message,
          // Updated variant to use only values that are valid for the toast component
          variant: "default",
        });
      }
    }
  }, [notifications, lastNotificationId, audio, soundEnabled, toast]);

  return null;
};

export default NotificationSound;
