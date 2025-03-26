
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "medication" | "appointment" | "procedure" | "system";
  read: boolean;
  created_at: string;
  event_id?: string;
  event_time?: string;
}

export const getNotifications = async (userId?: string) => {
  if (!userId) return [];
  
  try {
    console.log("Fetching notifications for user:", userId);
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
    
    return data as Notification[];
  } catch (error) {
    console.error("Error in getNotifications:", error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

export const createNotification = async (notification: Omit<Notification, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single();
    
    if (error) throw error;
    
    // Play sound for new notifications
    const audio = new Audio('/notification.mp3');
    audio.play().catch(err => console.log('Error playing notification sound:', err));
    
    // Show toast
    toast(notification.title, {
      description: notification.message,
      duration: 5000,
    });
    
    return data as Notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
};
