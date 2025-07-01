
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Message, Call, ChatWindow } from '@/types';
import { toast } from 'sonner';
import { sampleDoctors } from '@/lib/api/sampleDoctors';

export function useCommunicationService() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([]);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [isCallIncoming, setIsCallIncoming] = useState<boolean>(false);
  
  // Load online users - use mock data since database tables don't exist
  const fetchOnlineUsers = useCallback(async () => {
    if (!user) return;
    
    try {
      // Use sample doctors as mock online users
      const mockUsers = sampleDoctors.map(doctor => ({
        ...doctor,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        care_coins_balance: 0,
        careCoinsBalance: 0,
        online_status: Math.random() > 0.5, // Randomly set some as online
        organization: user.organization || doctor.organization
      })) as User[];
      
      setOnlineUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching online users:', error);
      toast.error('Failed to load contacts');
    }
  }, [user]);
  
  // Update user online status - mock implementation
  useEffect(() => {
    if (!user) return;
    
    fetchOnlineUsers();
    
    // Mock cleanup
    return () => {
      // Mock setting user as offline
    };
  }, [user, fetchOnlineUsers]);
  
  // Mock group calls subscription
  useEffect(() => {
    if (!user) return;
    
    // Mock subscription cleanup
    return () => {
      // Mock cleanup
    };
  }, [user]);
  
  // Mock messages subscription
  useEffect(() => {
    if (!user || chatWindows.length === 0) return;
    
    // Mock message loading for chat windows
    chatWindows.forEach(async (window) => {
      if (window.messages.length > 0) return;
      
      // Mock messages
      const mockMessages: Message[] = [
        {
          id: '1',
          sender_id: window.userId,
          recipient_id: user.id,
          content: `Hello ${user.name}! How are you today?`,
          timestamp: new Date().toISOString(),
          read: false
        }
      ];
      
      setChatWindows(prev => prev.map(w => 
        w.userId === window.userId 
          ? { ...w, messages: mockMessages } 
          : w
      ));
    });
    
    // Mock cleanup
    return () => {
      // Mock cleanup
    };
  }, [user, chatWindows]);
  
  // Mock active calls listener
  useEffect(() => {
    if (!user) return;
    
    // Mock cleanup
    return () => {
      // Mock cleanup
    };
  }, [user]);
  
  // Mock group call join events
  useEffect(() => {
    const handleJoinGroupCall = (event: CustomEvent<{ roomId: string; participants: string[]; isVideo: boolean }>) => {
      const { roomId, participants, isVideo } = event.detail;
      
      // Mock implementation
      console.log('Mock join group call:', { roomId, participants, isVideo });
    };
    
    window.addEventListener('join-group-call', handleJoinGroupCall);
    
    return () => {
      window.removeEventListener('join-group-call', handleJoinGroupCall);
    };
  }, []);
  
  // Open chat window with a user
  const openChatWindow = useCallback(async (userId: string, userName: string) => {
    setChatWindows(prev => {
      // Check if window already exists
      if (prev.find(window => window.userId === userId)) {
        return prev.map(window => window.userId === userId 
          ? { ...window, minimized: false } 
          : window
        );
      }
      return [...prev, { userId, userName, minimized: false, messages: [] }];
    });
  }, []);
  
  // Close chat window
  const closeChatWindow = useCallback((userId: string) => {
    setChatWindows(prev => prev.filter(window => window.userId !== userId));
  }, []);
  
  // Minimize chat window
  const minimizeChatWindow = useCallback((userId: string) => {
    setChatWindows(prev => prev.map(window => 
      window.userId === userId 
        ? { ...window, minimized: !window.minimized } 
        : window
    ));
  }, []);
  
  // Send message - mock implementation
  const sendMessage = useCallback(async (recipientId: string, content: string) => {
    if (!user) return;
    
    try {
      // Mock message sending
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        sender_id: user.id,
        recipient_id: recipientId,
        content,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setChatWindows(prev => prev.map(window => 
        window.userId === recipientId 
          ? { ...window, messages: [...window.messages, tempMessage] } 
          : window
      ));
      
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  }, [user]);
  
  // Start call - mock implementation
  const startCall = useCallback(async (userId: string, userName: string, isVideo: boolean) => {
    if (!user) return;
    
    try {
      // Mock call setup
      setActiveCall({
        callerId: user.id,
        callerName: user.name,
        receiverId: userId,
        receiverName: userName,
        isVideoCall: isVideo,
        status: 'ringing'
      });
      
      setIsCallActive(true);
      setIsCallIncoming(false);
      
      toast("Calling...", {
        description: `Calling ${userName}...`,
      });
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start call');
    }
  }, [user]);
  
  // Send group call invitation - mock implementation
  const sendGroupCallInvitation = useCallback(async (userId: string, roomId: string, isVideo: boolean) => {
    if (!user) return;
    
    try {
      // Mock group call invitation
      toast.success('Group call invitation sent');
    } catch (error) {
      console.error('Error sending group call invitation:', error);
    }
  }, [user]);
  
  // Accept call - mock implementation
  const acceptCall = useCallback(async () => {
    if (!user || !activeCall) return;
    
    try {
      setActiveCall(prev => prev ? { ...prev, status: 'ongoing' } : null);
      setIsCallIncoming(false);
      setIsCallActive(true);
      
      toast("Call Connected", {
        description: `Call connected with ${activeCall.callerName || activeCall.receiverName}`,
      });
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error('Failed to accept call');
    }
  }, [user, activeCall]);
  
  // Reject/end call - mock implementation
  const endCall = useCallback(async () => {
    if (!user || !activeCall) return;
    
    try {
      setActiveCall(null);
      setIsCallIncoming(false);
      setIsCallActive(false);
      
      toast("Call Ended", {
        description: `Call ended with ${activeCall.callerName || activeCall.receiverName}`,
      });
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Failed to end call');
    }
  }, [user, activeCall]);
  
  return {
    onlineUsers,
    chatWindows,
    activeCall,
    isCallActive,
    isCallIncoming,
    openChatWindow,
    closeChatWindow,
    minimizeChatWindow,
    sendMessage,
    startCall,
    acceptCall,
    endCall,
    fetchOnlineUsers,
    sendGroupCallInvitation
  };
}
