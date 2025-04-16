
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Bell, AlertTriangle, Pill, Bath, Droplets, HelpCircle, Loader2 } from 'lucide-react';
import { createCallLight } from '@/lib/api/callLightApi';
import { toast } from 'sonner';

interface CallLightButtonProps {
  patientId: string;
  patientName: string;
  roomNumber: string;
}

const CallLightButton: React.FC<CallLightButtonProps> = ({ 
  patientId, 
  patientName,
  roomNumber 
}) => {
  const [open, setOpen] = useState(false);
  const [requestType, setRequestType] = useState<'assistance' | 'emergency' | 'pain' | 'bathroom' | 'water' | 'other'>('assistance');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!requestType) {
      toast.error("Please select a request type");
      return;
    }

    setIsSubmitting(true);
    try {
      const callLight = await createCallLight({
        patient_id: patientId,
        room_number: roomNumber,
        request_type: requestType,
        message: message.trim() || undefined
      });

      if (callLight) {
        toast.success("Call light request sent");
        setOpen(false);
        setMessage('');
        setRequestType('assistance');
      }
    } catch (error) {
      console.error("Error creating call light:", error);
      toast.error("Failed to send call light request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        variant="default" 
        className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
      >
        <Bell className="h-4 w-4" />
        Call For Help
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call For Help</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">
                Patient: <span className="font-medium text-foreground">{patientName}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Room: <span className="font-medium text-foreground">{roomNumber}</span>
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>What do you need help with?</Label>
                <RadioGroup 
                  value={requestType} 
                  onValueChange={(value) => setRequestType(value as any)}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2 border rounded-md p-2">
                    <RadioGroupItem value="assistance" id="assistance" />
                    <Label htmlFor="assistance" className="flex items-center">
                      <HelpCircle className="mr-1.5 h-4 w-4" />
                      Assistance
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-2 border-red-200 bg-red-50">
                    <RadioGroupItem value="emergency" id="emergency" />
                    <Label htmlFor="emergency" className="flex items-center text-red-700">
                      <AlertTriangle className="mr-1.5 h-4 w-4" />
                      Emergency
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-2">
                    <RadioGroupItem value="pain" id="pain" />
                    <Label htmlFor="pain" className="flex items-center">
                      <Pill className="mr-1.5 h-4 w-4" />
                      Pain
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-2">
                    <RadioGroupItem value="bathroom" id="bathroom" />
                    <Label htmlFor="bathroom" className="flex items-center">
                      <Bath className="mr-1.5 h-4 w-4" />
                      Bathroom
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-2">
                    <RadioGroupItem value="water" id="water" />
                    <Label htmlFor="water" className="flex items-center">
                      <Droplets className="mr-1.5 h-4 w-4" />
                      Water
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Additional details (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Provide any additional information..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CallLightButton;
