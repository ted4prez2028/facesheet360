
import React, { useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MicOff, VideoOff, PhoneCall } from 'lucide-react';
import { useCommunication } from '@/context/CommunicationContext';

const CallDialog = () => {
  const { currentCall, endCall } = useCommunication();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const isDialogOpen = currentCall !== null && currentCall.status === 'ongoing';
  
  // Set up video streams when call is ongoing
  useEffect(() => {
    if (isDialogOpen) {
      // Get local media stream (this would come from CommunicationContext in a real implementation)
      navigator.mediaDevices
        .getUserMedia({ 
          video: currentCall?.isVideoCall, 
          audio: true 
        })
        .then(stream => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error('Error accessing media devices:', err));
      
      // Remote stream would be handled by WebRTC connection
    }
  }, [isDialogOpen, currentCall]);
  
  if (!currentCall) return null;
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={() => endCall()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0">
        <div className="relative bg-black rounded-t-lg overflow-hidden h-[400px] flex items-center justify-center">
          {currentCall.isVideoCall ? (
            <>
              {/* Remote video (large) */}
              <video
                ref={remoteVideoRef}
                id="remoteVideo"
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Local video (small overlay) */}
              <div className="absolute bottom-4 right-4 w-1/4 border-2 border-white rounded-lg overflow-hidden shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </>
          ) : (
            <div className="text-white flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-health-600 flex items-center justify-center mb-4">
                <span className="text-3xl">
                  {currentCall.callerName.charAt(0)}
                </span>
              </div>
              <h3 className="text-xl font-medium">
                {currentCall.callerId === currentCall.receiverId 
                  ? currentCall.callerName 
                  : currentCall.receiverName}
              </h3>
              <p className="text-gray-400">Voice call</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-4 p-4">
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
            <MicOff className="h-5 w-5" />
          </Button>
          {currentCall.isVideoCall && (
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
              <VideoOff className="h-5 w-5" />
            </Button>
          )}
          <Button 
            variant="destructive" 
            size="icon" 
            className="rounded-full h-12 w-12"
            onClick={endCall}
          >
            <PhoneCall className="h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallDialog;
