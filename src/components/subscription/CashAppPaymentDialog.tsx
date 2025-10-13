import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

interface CashAppPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  planName: string;
  onSuccess: () => void;
}

export function CashAppPaymentDialog({ 
  open, 
  onOpenChange, 
  amount, 
  planName,
  onSuccess 
}: CashAppPaymentDialogProps) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');
  
  // Generate CashApp payment link
  const cashAppLink = `https://cash.app/$FaceSheet360/${amount}`;
  
  // Simulate payment verification (in real app, this would be webhook-based)
  const simulatePaymentVerification = () => {
    setPaymentStatus('processing');
    
    setTimeout(() => {
      setPaymentStatus('success');
      toast.success('Payment verified successfully!');
      
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
      }, 2000);
    }, 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay with Cash App</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {paymentStatus === 'pending' && (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold mb-2">${amount.toFixed(2)}</p>
                <p className="text-muted-foreground">{planName}</p>
              </div>

              <Card className="p-6 bg-white">
                <div className="flex justify-center mb-4">
                  <QRCodeSVG value={cashAppLink} size={200} />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Scan with Cash App to pay
                </p>
              </Card>

              <div className="space-y-2">
                <p className="text-sm font-medium">Instructions:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Open Cash App on your phone</li>
                  <li>Scan the QR code above</li>
                  <li>Confirm payment of ${amount.toFixed(2)}</li>
                  <li>Wait for verification</li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.open(cashAppLink, '_blank')}
                >
                  Open Cash App Link
                </Button>
                <Button 
                  className="flex-1"
                  onClick={simulatePaymentVerification}
                >
                  I've Sent Payment
                </Button>
              </div>
            </>
          )}

          {paymentStatus === 'processing' && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="font-medium">Verifying payment...</p>
              <p className="text-sm text-muted-foreground mt-2">
                This usually takes a few seconds
              </p>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center py-12">
              <div className="bg-success/10 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Check className="h-10 w-10 text-success" />
              </div>
              <p className="font-medium text-lg">Payment Successful!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your account is being activated...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
