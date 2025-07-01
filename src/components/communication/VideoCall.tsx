
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PhoneOff } from 'lucide-react';

// Simplified video call component
const VideoCall = () => {
  const [isCallActive, setIsCallActive] = React.useState(false);
  
  const endCall = () => {
    setIsCallActive(false);
  };
  
  if (!isCallActive) return null;
  
  return (
    <Dialog open={isCallActive} onOpenChange={() => endCall()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0">
        <div className="relative bg-black rounded-t-lg overflow-hidden h-[400px] flex items-center justify-center">
          <div className="text-white flex flex-col items-center justify-center">
            <h3 className="text-xl font-medium">Video Call</h3>
            <p className="text-gray-400">Call in progress</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4 p-4 bg-gray-100">
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
