import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneCall,
  Copy,
  MessageSquare
} from 'lucide-react';
import { usePeerConnection } from '@/hooks/usePeerConnection';
import { useToast } from '@/components/ui/use-toast';

interface VideoCallInterfaceProps {
  contactName?: string;
  contactId?: string;
  onClose?: () => void;
}

const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
  contactName,
  contactId,
  onClose
}) => {
  const { toast } = useToast();
  const [remotePeerId, setRemotePeerId] = useState(contactId || '');
  const [transcriptions, setTranscriptions] = useState<string[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const {
    peerId,
    isConnected,
    isCallActive,
    isReceivingCall,
    localStream,
    remoteStream,
    callError,
    makeCall,
    answerCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    clearError
  } = usePeerConnection({
    enableVideo: true,
    enableAudio: true,
    onTranscription: (text: string) => {
      setTranscriptions(prev => [...prev, text]);
    }
  });

  // Update video elements when streams change
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Handle call error
  useEffect(() => {
    if (callError) {
      toast({
        title: "Call Error",
        description: callError,
        variant: "destructive",
      });
      clearError();
    }
  }, [callError, toast, clearError]);

  const handleMakeCall = () => {
    if (!remotePeerId.trim()) {
      toast({
        title: "Invalid Peer ID",
        description: "Please enter a valid peer ID to call",
        variant: "destructive",
      });
      return;
    }
    makeCall(remotePeerId);
  };

  const handleToggleVideo = () => {
    toggleVideo();
    setIsVideoEnabled(!isVideoEnabled);
  };

  const handleToggleAudio = () => {
    toggleAudio();
    setIsAudioEnabled(!isAudioEnabled);
  };

  const copyPeerId = () => {
    navigator.clipboard.writeText(peerId);
    toast({
      title: "Peer ID Copied",
      description: "Your peer ID has been copied to clipboard",
    });
  };

  const handleEndCall = () => {
    endCall();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Call {contactName && `with ${contactName}`}
            </CardTitle>
            <div className="flex items-center gap-2">
              {isConnected && (
                <Badge variant="secondary" className="bg-green-500 text-white">
                  Connected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="flex flex-col h-[70vh]">
            {/* Video Area */}
            <div className="flex-1 relative bg-gray-900">
              {/* Remote Video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ display: remoteStream ? 'block' : 'none' }}
              />
              
              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ display: localStream ? 'block' : 'none' }}
                />
                {!localStream && (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <VideoOff className="h-8 w-8" />
                  </div>
                )}
              </div>

              {/* Call Status */}
              {!isCallActive && !isReceivingCall && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center text-white">
                    <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No active call</p>
                  </div>
                </div>
              )}

              {isReceivingCall && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                  <div className="text-center text-white">
                    <PhoneCall className="h-16 w-16 mx-auto mb-4 animate-pulse" />
                    <p className="text-lg mb-4">Incoming call...</p>
                    <div className="flex gap-4 justify-center">
                      <Button onClick={answerCall} className="bg-green-500 hover:bg-green-600">
                        <Phone className="h-4 w-4 mr-2" />
                        Answer
                      </Button>
                      <Button onClick={rejectCall} variant="destructive">
                        <Phone className="h-4 w-4 mr-2 rotate-135" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls and Info */}
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex items-center justify-between mb-4">
                {/* Peer ID and Connection */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Your ID:</span>
                  <code className="bg-gray-200 px-2 py-1 rounded text-sm">{peerId}</code>
                  <Button size="sm" variant="outline" onClick={copyPeerId}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>

                {/* Call Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isAudioEnabled ? "default" : "destructive"}
                    onClick={handleToggleAudio}
                    disabled={!isCallActive}
                  >
                    {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant={isVideoEnabled ? "default" : "destructive"}
                    onClick={handleToggleVideo}
                    disabled={!isCallActive}
                  >
                    {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleEndCall}
                  >
                    <Phone className="h-4 w-4 rotate-135" />
                  </Button>
                </div>
              </div>

              {/* Make Call */}
              {!isCallActive && !isReceivingCall && (
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Enter peer ID to call"
                    value={remotePeerId}
                    onChange={(e) => setRemotePeerId(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleMakeCall} disabled={!isConnected}>
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              )}

              {/* Transcriptions */}
              {transcriptions.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm font-medium">Live Transcription</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto bg-white p-3 rounded border text-sm">
                    {transcriptions.map((text, index) => (
                      <p key={index} className="mb-1">
                        <span className="text-gray-500 text-xs">[{new Date().toLocaleTimeString()}]</span> {text}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoCallInterface;