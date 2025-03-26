
import React, { useRef, useEffect, useState } from 'react';
import { useCommunication } from '@/context/communication/CommunicationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minimize2, X, Send, Video, PhoneCall } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

const ChatWindows = () => {
  const { chatWindows } = useCommunication();
  
  return (
    <div className="fixed bottom-0 right-6 z-30 flex flex-row-reverse gap-2">
      {chatWindows.map((window) => (
        <ChatWindow key={window.userId} window={window} />
      ))}
    </div>
  );
};

const ChatWindow = ({ window }: { window: any }) => {
  const { user } = useAuth();
  const { minimizeChatWindow, closeChatWindow, sendMessage, startCall } = useCommunication();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [window.messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(window.userId, message);
      setMessage('');
    }
  };
  
  const userInitials = window.userName
    ? window.userName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
    : "?";
  
  if (window.minimized) {
    return (
      <Button
        className="flex items-center gap-2 mb-4 rounded-full h-12 shadow-md"
        onClick={() => minimizeChatWindow(window.userId)}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{window.userName}</span>
      </Button>
    );
  }
  
  return (
    <div className="w-80 h-96 rounded-t-md border border-border shadow-lg bg-background flex flex-col overflow-hidden">
      <div className="bg-health-600 text-white p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-white text-health-600 text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm truncate">{window.userName}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-white hover:bg-health-700"
            onClick={() => startCall(window.userId, window.userName, false)}
          >
            <PhoneCall className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-white hover:bg-health-700"
            onClick={() => startCall(window.userId, window.userName, true)}
          >
            <Video className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-white hover:bg-health-700"
            onClick={() => minimizeChatWindow(window.userId)}
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-white hover:bg-health-700"
            onClick={() => closeChatWindow(window.userId)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {window.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-4">
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            window.messages.map((msg: any) => {
              const isCurrentUser = msg.sender_id === user?.id;
              return (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex",
                    isCurrentUser ? "justify-end" : "justify-start"
                  )}
                >
                  <div 
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      isCurrentUser 
                        ? "bg-health-600 text-white" 
                        : "bg-muted text-foreground"
                    )}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {format(new Date(msg.timestamp), 'p')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSendMessage} className="p-2 border-t flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="text-sm"
        />
        <Button type="submit" size="icon" className="shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatWindows;
