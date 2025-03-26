import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { User, Message, Call, ChatWindow, ContactsState } from "@/types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

interface CommunicationContextType {
  contacts: ContactsState;
  chatWindows: ChatWindow[];
  activeCall: Call | null;
  isCallActive: boolean;
  isCallIncoming: boolean;
  toggleContacts: () => void;
  addOnlineUser: (user: User) => void;
  removeOnlineUser: (userId: string) => void;
  openChatWindow: (userId: string, userName: string) => void;
  closeChatWindow: (userId: string) => void;
  minimizeChatWindow: (userId: string) => void;
  maximizeChatWindow: (userId: string) => void;
  sendMessage: (recipientId: string, content: string) => void;
  startCall: (userId: string, userName: string, isVideo: boolean) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  setCallStatus: (status: Call["status"]) => void;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(
  undefined
);

export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (!context) {
    throw new Error(
      "useCommunication must be used within a CommunicationProvider"
    );
  }
  return context;
};

interface CommunicationProviderProps {
  children: React.ReactNode;
}

export const CommunicationProvider = ({ children }: CommunicationProviderProps) => {
  const [contacts, setContacts] = useState<ContactsState>({
    onlineUsers: [],
    isOpen: false,
  });
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([]);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [isCallIncoming, setIsCallIncoming] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    // Mock online users - replace with actual data fetching
    const mockOnlineUsers = [
      {
        id: "2",
        name: "Dr. Emily Carter",
        email: "emily.carter@example.com",
        role: "doctor",
      },
      {
        id: "3",
        name: "Nurse David Lee",
        email: "david.lee@example.com",
        role: "nurse",
      },
    ];

    // Add mock users to online users if they aren't the current user
    mockOnlineUsers.forEach((mockUser) => {
      if (user && mockUser.id !== user.id) {
        addOnlineUser(mockUser);
      }
    });
  }, [user]);

  const toggleContacts = () => {
    setContacts({ ...contacts, isOpen: !contacts.isOpen });
  };

  const addOnlineUser = (user: User) => {
    setContacts((prevContacts) => ({
      ...prevContacts,
      onlineUsers: [...prevContacts.onlineUsers, user],
    }));
  };

  const removeOnlineUser = (userId: string) => {
    setContacts((prevContacts) => ({
      ...prevContacts,
      onlineUsers: prevContacts.onlineUsers.filter((user) => user.id !== userId),
    }));
  };

  const openChatWindow = (userId: string, userName: string) => {
    setChatWindows((prevChatWindows) => {
      if (prevChatWindows.find((window) => window.userId === userId)) {
        return prevChatWindows;
      }
      return [...prevChatWindows, { userId, userName, minimized: false, messages: [] }];
    });
  };

  const closeChatWindow = (userId: string) => {
    setChatWindows((prevChatWindows) =>
      prevChatWindows.filter((window) => window.userId !== userId)
    );
  };

  const minimizeChatWindow = (userId: string) => {
    setChatWindows((prevChatWindows) =>
      prevChatWindows.map((window) =>
        window.userId === userId ? { ...window, minimized: true } : window
      )
    );
  };

  const maximizeChatWindow = (userId: string) => {
    setChatWindows((prevChatWindows) =>
      prevChatWindows.map((window) =>
        window.userId === userId ? { ...window, minimized: false } : window
      )
    );
  };

  const startCall = useCallback((userId: string, userName: string, isVideo: boolean) => {
    if (!user) {
      toast.error("You must be logged in to start a call.");
      return;
    }

    const newCall: Call = {
      callerId: user.id,
      callerName: user.name,
      receiverId: userId,
      receiverName: userName,
      isVideoCall: isVideo,
      status: "ringing",
    };

    setActiveCall(newCall);
    setIsCallActive(true);
    setIsCallIncoming(false);
    
    toast("Calling...", {
      description: `Calling ${userName}...`,
    });
  }, [user]);

  const acceptCall = useCallback(() => {
    setIsCallActive(true);
    setIsCallIncoming(false);
    setCallStatus("ongoing");
    
    toast("Call Connected", {
      description: `Call connected with ${activeCall?.callerName || activeCall?.receiverName}`,
    });
  }, [activeCall]);

  const rejectCall = useCallback(() => {
    setIsCallActive(false);
    setIsCallIncoming(false);
    setActiveCall(null);
    setCallStatus("ended");
    
    toast("Call Rejected", {
      description: "Call rejected",
    });
  }, []);

  const endCall = useCallback(() => {
    setIsCallActive(false);
    setIsCallIncoming(false);
    setActiveCall(null);
    setCallStatus("ended");
    
    toast("Call Ended", {
      description: `Call ended with ${activeCall?.callerName || activeCall?.receiverName}`,
    });
  }, [activeCall]);

  const sendMessage = (recipientId: string, content: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      sender_id: user?.id || "default_sender_id",
      recipient_id: recipientId,
      content: content,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setChatWindows((prevChatWindows) => {
      return prevChatWindows.map((window) => {
        if (window.userId === recipientId) {
          return {
            ...window,
            messages: [...window.messages, newMessage],
          };
        }
        return window;
      });
    });
  };

  const setCallStatus = (status: Call["status"]) => {
    setActiveCall((prevCall) => {
      if (prevCall) {
        return { ...prevCall, status: status };
      }
      return prevCall;
    });

    if (status === "ringing") {
      setIsCallIncoming(true);
      setIsCallActive(true);
    } else {
      setIsCallIncoming(false);
    }
  };

  const contextValue: CommunicationContextType = {
    contacts,
    chatWindows,
    activeCall,
    isCallActive,
    isCallIncoming,
    toggleContacts,
    addOnlineUser,
    removeOnlineUser,
    openChatWindow,
    closeChatWindow,
    minimizeChatWindow,
    maximizeChatWindow,
    sendMessage,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    setCallStatus,
  };

  return (
    <CommunicationContext.Provider value={contextValue}>
      {children}
    </CommunicationContext.Provider>
  );
};
