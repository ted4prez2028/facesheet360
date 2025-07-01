
// Mock notification API since notifications table doesn't exist in Supabase

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string; // 'medication', 'appointment', 'procedure', 'system'
  read: boolean;
  created_at: string;
  event_id?: string;
  event_time?: string;
}

export type CreateNotificationInput = Omit<Notification, "id" | "created_at">;

/**
 * Get all notifications for a user (Mock implementation)
 */
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  console.log('Mock: Getting notifications for user:', userId);
  
  // Return mock notifications
  return [
    {
      id: '1',
      user_id: userId,
      title: 'Medication Reminder',
      message: 'Time to take your medication',
      type: 'medication',
      read: false,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      user_id: userId,
      title: 'Appointment Scheduled',
      message: 'Your appointment has been scheduled for tomorrow',
      type: 'appointment',
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];
};

/**
 * Mark a notification as read (Mock implementation)
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  console.log('Mock: Marking notification as read:', notificationId);
};

/**
 * Create a new notification (Mock implementation)
 */
export const createNotification = async (notification: CreateNotificationInput): Promise<Notification> => {
  const mockNotification: Notification = {
    id: `notif_${Date.now()}`,
    ...notification,
    created_at: new Date().toISOString()
  };
  
  console.log('Mock: Creating notification:', mockNotification);
  return mockNotification;
};

/**
 * Mark all notifications as read for a user (Mock implementation)
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  console.log('Mock: Marking all notifications as read for user:', userId);
};
