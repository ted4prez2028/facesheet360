import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function BackgroundTransfer() {
  const [isTransferring, setIsTransferring] = useState(false);

  const initiateTransfer = async () => {
    setIsTransferring(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('transfer-carecoin', {
        body: {
          contractAddress: "0xa546f4c3f0c73", // Note: This seems incomplete - may need full address
          recipientAddress: "0x87b06799B1F57b2D7777eB1dc335D3ab40Bd986B",
          amount: "5000"
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        toast.success("Transfer initiated in background! Check function logs for progress.");
      } else {
        throw new Error(data.error || 'Transfer failed');
      }

    } catch (error) {
      console.error('Transfer error:', error);
      toast.error(`Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTransferring(false);
    }
  };

  useEffect(() => {
    initiateTransfer();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Background CareCoin Transfer</CardTitle>
        <CardDescription>
          Transferring 5000 CARE tokens in background
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          <p><strong>Amount:</strong> 5000 CARE</p>
          <p><strong>To:</strong> 0x87b06799B1F57b2D7777eB1dc335D3ab40Bd986B</p>
          <p><strong>Status:</strong> {isTransferring ? 'Processing...' : 'Initiated'}</p>
        </div>
      </CardContent>
    </Card>
  );
}