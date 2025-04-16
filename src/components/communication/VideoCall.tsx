
import React, { useRef, useEffect, useState } from 'react';
import { useCommunication } from '@/context/communication/CommunicationContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MicOff, Mic, VideoOff, Video, PhoneOff, Volume2, Volume } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const VideoCall = () => {
  const { 
    activeCall, 
    endCall, 
    localStream,
    remoteStreams,
    toggleAudio, 
    toggleVideo 
  } = useCommunication();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const isDialogOpen = activeCall !== null && activeCall.status === 'ongoing';
  
  // Get the remote stream (there should be only one for a 1-on-1 call)
  const remotePeerId = activeCall && (activeCall.callerId === activeCall.receiverId 
    ? activeCall.callerName 
    : activeCall.receiverName);
  
  const remoteStream = remotePeerId && remoteStreams.size > 0 
    ? Array.from(remoteStreams.values())[0] 
    : null;
  
  // Set up video streams when call is ongoing
  useEffect(() => {
    // Set local stream to video element
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    
    // Set remote stream to video element
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream, isDialogOpen]);
  
  // Call duration timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isDialogOpen) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isDialogOpen]);
  
  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Toggle microphone
  const handleToggleMic = () => {
    toggleAudio(!micMuted);
    setMicMuted(!micMuted);
  };
  
  // Toggle video
  const handleToggleVideo = () => {
    toggleVideo(!videoOff);
    setVideoOff(!videoOff);
  };
  
  // Toggle speaker
  const toggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !remoteVideoRef.current.muted;
      setSpeakerMuted(!speakerMuted);
    }
  };
  
  if (!activeCall) return null;
  
  const remoteUserName = activeCall.callerId === activeCall.receiverId 
    ? activeCall.callerName 
    : activeCall.receiverName;
  
  const remoteUserInitials = remoteUserName
    ? remoteUserName.split(" ").map(n => n[0]).join("")
    : "?";
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={() => endCall()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0">
        <div className="relative bg-black rounded-t-lg overflow-hidden h-[400px] flex items-center justify-center">
          {activeCall.isVideoCall ? (
            <>
              {/* Remote video (large) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Call duration */}
              <div className="absolute top-4 left-4 bg-black/50 px-2 py-1 rounded-md text-white text-sm">
                {formatDuration(callDuration)}
              </div>
              
              {/* Local video (small overlay) */}
              <div className={`absolute bottom-4 right-4 w-1/4 border-2 border-white rounded-lg overflow-hidden shadow-lg ${videoOff ? 'bg-gray-800' : ''}`}>
                {videoOff ? (
                  <div className="w-full h-full aspect-video flex items-center justify-center text-white">
                    <Video className="h-8 w-8 opacity-50" />
                  </div>
                ) : (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="text-white flex flex-col items-center justify-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarFallback className="bg-health-600 text-white text-3xl">
                  {remoteUserInitials}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-medium">{remoteUserName}</h3>
              <p className="text-gray-400">Voice call</p>
              <p className="mt-4 text-gray-300">{formatDuration(callDuration)}</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-4 p-4 bg-gray-100">
          {/* Microphone toggle */}
          <Button 
            variant="outline" 
            size="icon" 
            className={`rounded-full h-12 w-12 ${micMuted ? 'bg-red-100' : ''}`}
            onClick={handleToggleMic}
          >
            {micMuted ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5" />}
          </Button>
          
          {/* Video toggle (only for video calls) */}
          {activeCall.isVideoCall && (
            <Button 
              variant="outline" 
              size="icon" 
              className={`rounded-full h-12 w-12 ${videoOff ? 'bg-red-100' : ''}`}
              onClick={handleToggleVideo}
            >
              {videoOff ? <VideoOff className="h-5 w-5 text-red-500" /> : <Video className="h-5 w-5" />}
            </Button>
          )}
          
          {/* Speaker toggle */}
          <Button 
            variant="outline" 
            size="icon" 
            className={`rounded-full h-12 w-12 ${speakerMuted ? 'bg-red-100' : ''}`}
            onClick={toggleSpeaker}
          >
            {speakerMuted ? <Volume className="h-5 w-5 text-red-500" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          
          {/* End call */}
          <Button 
            variant="destructive" 
            size="icon" 
            className="rounded-full h-12 w-12"
            onClick={endCall}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoCall;
