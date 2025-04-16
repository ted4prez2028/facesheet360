
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, Users } from 'lucide-react';
import { useCommunication } from '@/context/communication/CommunicationContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const GroupVideoCall: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const { 
    isGroupCall, 
    endCall, 
    toggleAudio, 
    toggleVideo,
    localStream,
    remoteStreams,
    participants
  } = useCommunication();
  
  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    toggleAudio(newMuted);
  };
  
  const handleToggleVideo = () => {
    const newVideoOff = !isVideoOff;
    setIsVideoOff(newVideoOff);
    toggleVideo(newVideoOff);
  };
  
  const handleEndCall = () => {
    endCall();
  };
  
  // Calculate grid columns based on number of participants
  const getGridColumns = () => {
    const totalStreams = remoteStreams.size + 1; // +1 for local stream
    if (totalStreams <= 2) return "grid-cols-1";
    if (totalStreams <= 4) return "grid-cols-2";
    return "grid-cols-3"; // For 5+ participants
  };
  
  return (
    <Dialog open={isGroupCall} onOpenChange={(open) => !open && endCall()}>
      <DialogContent className="max-w-5xl w-full p-0 h-[90vh] max-h-[90vh] overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Call ({remoteStreams.size + 1} participants)
          </DialogTitle>
        </DialogHeader>
        
        <div className={`grid ${getGridColumns()} gap-2 p-2 flex-1 overflow-y-auto h-[calc(90vh-10rem)]`}>
          {/* Local Stream */}
          <div className="relative rounded-md overflow-hidden bg-black aspect-video flex items-center justify-center">
            {localStream && !isVideoOff ? (
              <video 
                ref={video => {
                  if (video && localStream) {
                    video.srcObject = localStream;
                    video.muted = true; // Mute local video to avoid echo
                  }
                }} 
                autoPlay 
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-health-600 text-white text-2xl">
                  You
                </AvatarFallback>
              </Avatar>
            )}
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-sm rounded">
              You {isMuted && "(Muted)"}
            </div>
          </div>
          
          {/* Remote Streams */}
          {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
            <div 
              key={peerId} 
              className="relative rounded-md overflow-hidden bg-black aspect-video flex items-center justify-center"
            >
              <video 
                ref={video => {
                  if (video && stream) {
                    video.srcObject = stream;
                  }
                }} 
                autoPlay 
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-sm rounded">
                Participant {peerId.substring(0, 5)}...
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t flex items-center justify-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            className={`h-12 w-12 rounded-full ${isMuted ? 'bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600' : ''}`}
            onClick={handleToggleMute}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button 
            variant="destructive" 
            size="icon" 
            className="h-14 w-14 rounded-full"
            onClick={handleEndCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className={`h-12 w-12 rounded-full ${isVideoOff ? 'bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600' : ''}`}
            onClick={handleToggleVideo}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupVideoCall;
