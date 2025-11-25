import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Mic, MicOff, Phone } from 'lucide-react';
import { usePeerConnection } from '@/hooks/usePeerConnection';

interface VideoCallInterfaceProps {
  contactName?: string;
  contactId?: string;
  onClose?: () => void;
}

const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({ contactName, onClose }) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  const {
    remoteStream,
    isConnected,
    localVideoRef,
    remoteVideoRef,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
  } = usePeerConnection({ video: true, audio: true });

  useEffect(() => {
    startCall();
    return () => endCall();
  }, []);

  const handleEndCall = () => {
    endCall();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl">
        <CardHeader className="bg-primary text-primary-foreground">
          <div className="flex justify-between items-center">
            <CardTitle>Video Call {contactName && `with ${contactName}`}</CardTitle>
            {isConnected && <Badge className="bg-green-500">Connected</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative bg-black h-[70vh]">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {!remoteStream && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <p>Waiting for participant...</p>
              </div>
            )}
            <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="p-4 flex justify-center gap-4">
            <Button onClick={() => { toggleAudio(); setIsAudioEnabled(!isAudioEnabled); }} variant={isAudioEnabled ? 'default' : 'destructive'} size="lg" className="rounded-full">
              {isAudioEnabled ? <Mic /> : <MicOff />}
            </Button>
            <Button onClick={() => { toggleVideo(); setIsVideoEnabled(!isVideoEnabled); }} variant={isVideoEnabled ? 'default' : 'destructive'} size="lg" className="rounded-full">
              {isVideoEnabled ? <Video /> : <VideoOff />}
            </Button>
            <Button onClick={handleEndCall} variant="destructive" size="lg" className="rounded-full">
              <Phone className="rotate-[135deg]" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoCallInterface;
