import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  Phone, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  FileText, 
  Paperclip,
  Send,
  Languages,
  VolumeX,
  Volume2,
  X,
  Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  user_id: string;
  author: string;
  content: string;
  message_type: string;
  platform: string;
  file_url?: string;
  file_name?: string;
  translated_content?: string;
  created_at: string;
}

interface EnhancedCommunicationSystemProps {
  onClose: () => void;
}

export const EnhancedCommunicationSystem: React.FC<EnhancedCommunicationSystemProps> = ({ onClose }) => {
  const [activeView, setActiveView] = useState<'chat' | 'call' | 'video'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('es'); // Spanish default
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  
  const { user } = useAuth();

  useEffect(() => {
    loadMessages();
    setupRealTimeSubscription();
  }, []);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupRealTimeSubscription = () => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const messageData = {
        user_id: user.id,
        author: user.name || 'Unknown User',
        content: newMessage,
        message_type: 'text',
        platform: 'careconnect',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        await uploadVoiceMessage(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting voice recording:', error);
      toast.error('Failed to start voice recording');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadVoiceMessage = async (audioBlob: Blob) => {
    try {
      const fileName = `voice_${Date.now()}.wav`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-messages')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('voice-messages')
        .getPublicUrl(fileName);

      const messageData = {
        user_id: user!.id,
        author: user!.name || 'Unknown User',
        content: 'Voice message',
        message_type: 'voice',
        platform: 'careconnect',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) throw error;
    } catch (error) {
      console.error('Error uploading voice message:', error);
      toast.error('Failed to upload voice message');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileName = `file_${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('shared-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('shared-files')
        .getPublicUrl(fileName);

      const messageData = {
        user_id: user.id,
        author: user.name || 'Unknown User',
        content: `Shared file: ${file.name}`,
        message_type: 'file',
        platform: 'careconnect',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) throw error;
      
      toast.success('File shared successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  const translateMessage = async (message: Message) => {
    if (isTranslating) return;
    
    setIsTranslating(true);
    try {
      // In a real implementation, you would use a translation service like Google Translate API
      // For demo purposes, we'll simulate translation
      const translatedContent = `[Translated to ${targetLanguage}] ${message.content}`;
      
      // Update the message with translation
      setMessages(prev => prev.map(msg => 
        msg.id === message.id 
          ? { ...msg, translated_content: translatedContent }
          : msg
      ));
      
      toast.success('Message translated');
    } catch (error) {
      console.error('Error translating message:', error);
      toast.error('Failed to translate message');
    } finally {
      setIsTranslating(false);
    }
  };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsCallActive(true);
      setIsVideoOn(true);
      setActiveView('video');
      
      // Initialize PeerJS connection
      initializePeerConnection(stream);
    } catch (error) {
      console.error('Error starting video call:', error);
      toast.error('Failed to start video call');
    }
  };

  const initializePeerConnection = (stream: MediaStream) => {
    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };
    
    const peerConnection = new RTCPeerConnection(configuration);
    
    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });
    
    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    
    peerConnectionRef.current = peerConnection;
  };

  const endCall = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    setIsCallActive(false);
    setIsVideoOn(false);
    setActiveView('chat');
  };

  const toggleMute = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  return (
    <Card className="w-96 h-[600px] fixed bottom-4 right-4 z-50 shadow-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Communication</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeView === 'chat' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('chat')}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Chat
          </Button>
          <Button
            variant={activeView === 'call' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('call')}
          >
            <Phone className="h-4 w-4 mr-1" />
            Call
          </Button>
          <Button
            variant={activeView === 'video' ? 'default' : 'outline'}
            size="sm"
            onClick={startVideoCall}
          >
            <Video className="h-4 w-4 mr-1" />
            Video
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 h-[500px] flex flex-col">
        {activeView === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col space-y-1">
                  <div className={`p-2 rounded-lg ${
                    message.user_id === user?.id 
                      ? 'bg-blue-500 text-white ml-8' 
                      : 'bg-gray-100 mr-8'
                  }`}>
                    <div className="text-xs font-medium">{message.author}</div>
                    <div className="text-sm">{message.content}</div>
                    {message.translated_content && (
                      <div className="text-xs italic mt-1 opacity-80">
                        {message.translated_content}
                      </div>
                    )}
                    {message.message_type === 'voice' && (
                      <audio controls className="mt-2">
                        <source src={message.file_url} type="audio/wav" />
                      </audio>
                    )}
                    {message.message_type === 'file' && (
                      <a 
                        href={message.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-300 underline text-xs"
                      >
                        📎 {message.file_name}
                      </a>
                    )}
                  </div>
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => translateMessage(message)}
                      disabled={isTranslating}
                    >
                      <Languages className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onMouseDown={startVoiceRecording}
                  onMouseUp={stopVoiceRecording}
                  className={isRecording ? 'bg-red-100 border-red-300' : ''}
                >
                  <Mic className="h-4 w-4" />
                  {isRecording ? 'Recording...' : 'Voice'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                  File
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </>
        )}
        
        {activeView === 'video' && (
          <div className="flex-1 flex flex-col">
            <div className="relative flex-1 bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute bottom-4 right-4 w-24 h-18 rounded border-2 border-white"
              />
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="sm"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <Button
                variant={!isVideoOn ? "destructive" : "outline"}
                size="sm"
                onClick={toggleVideo}
              >
                {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={endCall}
              >
                <Phone className="h-4 w-4" />
                End
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};