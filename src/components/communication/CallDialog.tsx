
import React, { useEffect, useRef } from 'react';
import { useCommunication } from '@/context/communication/CommunicationContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

const CallDialog = () => {
  const { 
    activeCall, 
    isCallActive, 
    isCallIncoming,
    acceptCall, 
    rejectCall, 
    endCall,
    toggleAudio,
    toggleVideo,
    localStream,
    remoteStreams
  } = useCommunication();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);
  
  // Set up local video stream
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  
  // Set up remote video stream
  useEffect(() => {
    if (remoteStreams && remoteStreams.size > 0 && remoteVideoRef.current) {
      const firstRemoteStream = remoteStreams.values().next().value;
      remoteVideoRef.current.srcObject = firstRemoteStream;
    }
  }, [remoteStreams]);
  
  const handleToggleAudio = () => {
    toggleAudio(!isMuted);
    setIsMuted(!isMuted);
  };
  
  const handleToggleVideo = () => {
    toggleVideo(!isVideoOff);
    setIsVideoOff(!isVideoOff);
  };
  
  if (!isCallActive || !activeCall) return null;
  
  const otherPersonName = activeCall?.callerId === 'current-user' 
    ? activeCall?.receiverName 
    : activeCall?.callerName;
  
  const isVideoCall = activeCall?.isVideoCall;
  const isOngoing = activeCall?.status === 'ongoing';
  
  return (
    <Dialog open={isCallActive} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[400px] p-0">
        {isVideoCall && isOngoing ? (
          <div className="relative">
            {/* Remote Video (Full Screen) */}
            <div className="w-full h-[400px] bg-gray-900">
              <video 
                ref={remoteVideoRef}
                autoPlay 
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute bottom-4 right-4 w-1/4 rounded-lg overflow-hidden border-2 border-white">
              <video 
                ref={localVideoRef}
                autoPlay 
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src="/placeholder-avatar.jpg" alt={otherPersonName} />
              <AvatarFallback className="text-2xl">
                {otherPersonName?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="text-xl font-medium mb-2">{otherPersonName}</h3>
            
            <div className="text-sm text-muted-foreground mb-4">
              {isOngoing ? (
                <span className="flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  On Call
                </span>
              ) : isCallIncoming ? (
                "Incoming Call..."
              ) : (
                "Calling..."
              )}
            </div>
          </div>
        )}
        
        <div className="bg-muted p-4 flex items-center justify-center gap-4">
          {isOngoing ? (
            <>
              <Button 
                variant={isMuted ? "destructive" : "secondary"} 
                size="icon" 
                onClick={handleToggleAudio}
              >
                {isMuted ? <MicOff /> : <Mic />}
              </Button>
              
              {isVideoCall && (
                <Button 
                  variant={isVideoOff ? "destructive" : "secondary"} 
                  size="icon"
                  onClick={handleToggleVideo}
                >
                  {isVideoOff ? <VideoOff /> : <Video />}
                </Button>
              )}
              
              <Button 
                variant="destructive" 
                size="icon" 
                onClick={endCall}
              >
                <PhoneOff />
              </Button>
            </>
          ) : isCallIncoming ? (
            <>
              <Button 
                variant="default" 
                size="icon" 
                className="bg-green-500 hover:bg-green-600"
                onClick={acceptCall}
              >
                <Phone />
              </Button>
              
              <Button 
                variant="destructive" 
                size="icon" 
                onClick={rejectCall}
              >
                <PhoneOff />
              </Button>
            </>
          ) : (
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={endCall}
            >
              <PhoneOff />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallDialog;
