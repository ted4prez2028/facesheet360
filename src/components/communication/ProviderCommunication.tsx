import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Phone, Video, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Provider {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

const MOCK_PROVIDERS: Provider[] = [
  { id: '1', name: 'Dr. Sarah Johnson', role: 'Cardiologist', status: 'online' },
  { id: '2', name: 'Dr. Michael Chen', role: 'Neurologist', status: 'online' },
  { id: '3', name: 'Nurse Emily Davis', role: 'RN', status: 'online' },
  { id: '4', name: 'Dr. James Wilson', role: 'Surgeon', status: 'busy' },
  { id: '5', name: 'Dr. Lisa Brown', role: 'Pediatrician', status: 'offline' },
];

export function ProviderCommunication() {
  const [activeChat, setActiveChat] = useState<Provider | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeChat) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: messageInput,
      timestamp: new Date()
    };
    
    setMessages([...messages, newMessage]);
    setMessageInput('');
    
    // Simulate response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        senderId: activeChat.id,
        text: 'Message received. I\'ll get back to you shortly.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const startCall = (provider: Provider, type: 'audio' | 'video') => {
    setActiveChat(provider);
    setCallType(type);
    setIsCallActive(true);
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallType(null);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online': return 'bg-success';
      case 'busy': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Providers List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Healthcare Providers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {MOCK_PROVIDERS.map(provider => (
              <div
                key={provider.id}
                className={cn(
                  "p-4 hover:bg-muted cursor-pointer transition-colors",
                  activeChat?.id === provider.id && "bg-muted"
                )}
                onClick={() => {
                  setActiveChat(provider);
                  setIsCallActive(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>{provider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background", getStatusColor(provider.status))} />
                    </div>
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-muted-foreground">{provider.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        startCall(provider, 'audio');
                      }}
                      disabled={provider.status === 'offline'}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        startCall(provider, 'video');
                      }}
                      disabled={provider.status === 'offline'}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat/Call Window */}
      <Card className={cn("lg:col-span-2", isMinimized && "h-16")}>
        {activeChat ? (
          <>
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{activeChat.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{activeChat.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{activeChat.role}</p>
                </div>
                <Badge variant={activeChat.status === 'online' ? 'default' : 'secondary'}>
                  {activeChat.status}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => setIsMinimized(!isMinimized)}>
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setActiveChat(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {!isMinimized && (
              <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
                {isCallActive ? (
                  // Call Interface
                  <div className="flex-1 bg-accent/10 flex items-center justify-center relative">
                    {callType === 'video' ? (
                      <div className="w-full h-full bg-black relative">
                        {/* Remote Video (simulated) */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Avatar className="w-32 h-32">
                            <AvatarFallback className="text-4xl">
                              {activeChat.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        {/* Local Video (simulated) */}
                        <div className="absolute bottom-4 right-4 w-48 h-36 bg-muted rounded-lg flex items-center justify-center">
                          <p className="text-sm text-muted-foreground">Your Camera</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Avatar className="w-32 h-32 mx-auto mb-4">
                          <AvatarFallback className="text-4xl">
                            {activeChat.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-lg font-medium">{activeChat.name}</p>
                        <p className="text-muted-foreground">Call in progress...</p>
                      </div>
                    )}
                    
                    {/* Call Controls */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                      <Button variant="destructive" onClick={endCall} className="rounded-full px-8">
                        <Phone className="h-4 w-4 mr-2" />
                        End Call
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Messages Interface
                  <>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                          <p>Start a conversation with {activeChat.name}</p>
                        </div>
                      ) : (
                        messages.map(msg => (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex",
                              msg.senderId === 'me' ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[70%] rounded-lg px-4 py-2",
                                msg.senderId === 'me' 
                                  ? "bg-primary text-primary-foreground" 
                                  : "bg-muted"
                              )}
                            >
                              <p>{msg.text}</p>
                              <p className={cn(
                                "text-xs mt-1",
                                msg.senderId === 'me' ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}>
                                {msg.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button onClick={handleSendMessage}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            )}
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p>Select a provider to start messaging or calling</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
