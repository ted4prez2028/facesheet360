
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '@/types';
import { XIcon, MinusIcon, PhoneIcon, VideoIcon, Send } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCommunication } from '@/context/communication/CommunicationContext';
import { format } from 'date-fns';

interface ChatWindowProps {
  userId: string;
  userName: string;
  minimized: boolean;
  messages: Message[];
}

const ChatWindow = ({ userId, userName, minimized, messages }: ChatWindowProps) => {
  const { 
    closeChatWindow, 
    minimizeChatWindow, 
    sendMessage, 
    startCall 
  } = useCommunication();
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!minimized && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, minimized]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim()) {
      sendMessage(userId, newMessage);
      setNewMessage('');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  if (minimized) {
    return (
      <Card className="w-64 shadow-md">
        <CardHeader className="p-3 bg-primary text-primary-foreground flex flex-row justify-between items-center cursor-pointer"
          onClick={() => minimizeChatWindow(userId)}
        >
          <div className="font-medium truncate">{userName}</div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground" 
              onClick={(e) => {
                e.stopPropagation();
                closeChatWindow(userId);
              }}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-80 shadow-md flex flex-col h-96">
      <CardHeader className="p-3 bg-primary text-primary-foreground flex flex-row justify-between items-center">
        <div className="font-medium truncate">{userName}</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground"
            onClick={() => startCall(userId, userName, false)}
          >
            <PhoneIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground"
            onClick={() => startCall(userId, userName, true)}
          >
            <VideoIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground"
            onClick={() => minimizeChatWindow(userId)}
          >
            <MinusIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground" 
            onClick={() => closeChatWindow(userId)}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 overflow-y-auto flex-grow space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm h-full flex items-center justify-center">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((message, index) => {
            const isMine = message.sender_id !== userId;
            const showTimestamp = index === 0 || 
              new Date(message.timestamp).getDate() !== new Date(messages[index - 1].timestamp).getDate();
            
            return (
              <React.Fragment key={message.id}>
                {showTimestamp && (
                  <div className="text-xs text-center text-muted-foreground my-2">
                    {format(new Date(message.timestamp), 'MMMM d, yyyy')}
                  </div>
                )}
                <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-2 max-w-[80%] ${isMine ? 'flex-row-reverse' : ''}`}>
                    {!isMine && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <div className={`px-3 py-2 rounded-lg text-sm ${
                        isMine 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        {message.content}
                      </div>
                      <div className={`text-xs text-muted-foreground mt-1 ${
                        isMine ? 'text-right' : 'text-left'
                      }`}>
                        {format(new Date(message.timestamp), 'h:mm a')}
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      
      <Separator />
      
      <CardFooter className="p-2">
        <form className="flex w-full gap-2" onSubmit={handleSendMessage}>
          <Input 
            placeholder="Type a message..." 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatWindow;
