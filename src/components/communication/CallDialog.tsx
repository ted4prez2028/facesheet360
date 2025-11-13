
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff } from 'lucide-react';

const CallDialog = () => {
  // Simplified version - remove complex call state for now
  const [isCallActive, setIsCallActive] = React.useState(false);
  
  const handleEndCall = () => {
    setIsCallActive(false);
  };

  if (!isCallActive) return null;
  
  return (
    <Dialog open={isCallActive} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[400px] p-0">
        <div className="flex flex-col items-center justify-center py-8">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src="/placeholder-avatar.jpg" alt="Contact" />
            <AvatarFallback className="text-2xl">
              ?
            </AvatarFallback>
          </Avatar>
          
          <h3 className="text-xl font-medium mb-2">Contact</h3>
          
          <div className="text-sm text-muted-foreground mb-4">
            <span>Call in progress...</span>
          </div>
        </div>
        
        <div className="bg-muted p-4 flex items-center justify-center gap-4">
          <Button 
            variant="destructive" 
            size="icon" 
            onClick={handleEndCall}
          >
            <PhoneOff />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallDialog;
