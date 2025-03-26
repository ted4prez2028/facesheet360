
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clipboard, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode.react';

interface CashAppPaymentProps {
  amount: number;
  purchaseType: string;
  onComplete: () => void;
  onCancel: () => void;
}

const CashAppPayment: React.FC<CashAppPaymentProps> = ({ 
  amount, 
  purchaseType, 
  onComplete, 
  onCancel 
}) => {
  const [paymentId, setPaymentId] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Fake CashApp username/handle - in a real app, this would be a company account
  const cashAppHandle = '$CareConnect';
  
  useEffect(() => {
    // Generate a unique payment ID
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    setPaymentId(uniqueId);
    
    // Generate CashApp payment URL 
    // Format is: cash.app/$USERNAME/$AMOUNT/optional-note
    const paymentUrl = `https://cash.app/${cashAppHandle}/${amount}/${paymentId}-${purchaseType}`;
    setQrValue(paymentUrl);
  }, [amount, purchaseType]);
  
  const copyPaymentInfo = () => {
    navigator.clipboard.writeText(`${cashAppHandle} $${amount} Ref: ${paymentId}`);
    toast.success('Payment info copied to clipboard');
  };
  
  const verifyPayment = () => {
    setIsVerifying(true);
    
    // In a real app, this would check with a backend API if the payment was received
    // For demo purposes, we'll just simulate a check after 2 seconds
    setTimeout(() => {
      // Simulate successful payment 80% of the time
      const isSuccessful = Math.random() < 0.8;
      
      if (isSuccessful) {
        toast.success('Payment verified successfully!');
        onComplete();
      } else {
        toast.error('Payment not found. Please try again or contact support.');
        setIsVerifying(false);
      }
    }, 2000);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Pay with CashApp</CardTitle>
        <CardDescription>
          Send ${amount} to complete your purchase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-white rounded-lg">
            <QRCode value={qrValue} size={200} />
          </div>
        </div>
        
        <div className="p-3 bg-muted rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">CashApp Handle:</div>
              <div className="text-lg font-semibold">{cashAppHandle}</div>
            </div>
            <Button size="sm" variant="ghost" onClick={copyPaymentInfo}>
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-2">
            <div className="font-medium">Amount:</div>
            <div className="text-lg font-semibold">${amount}</div>
          </div>
          
          <div className="mt-2">
            <div className="font-medium">Reference ID:</div>
            <div className="text-sm">{paymentId}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Include this ID in the payment note
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={verifyPayment} disabled={isVerifying}>
          {isVerifying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'I\'ve Paid'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CashAppPayment;
