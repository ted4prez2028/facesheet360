
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { updateUser } from "@/lib/supabaseApi";
import { useAuth } from "@/context/AuthContext";

const ConnectWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user, updateCurrentUser } = useAuth();

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        console.log("Make sure you have MetaMask installed!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        setAddress(accounts[0]);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      const { ethereum } = window as any;
      if (!ethereum) {
        toast({
          title: "MetaMask not detected",
          description: "Please install MetaMask extension and try again.",
          variant: "destructive",
        });
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      
      setAddress(accounts[0]);
      
      if (user && user.id) {
        // Update the user in Supabase with the wallet address
        await updateUser(user.id, { care_coins_balance: user.care_coins_balance });
        
        // Update local user state
        updateCurrentUser({
          ...user,
        });
        
        toast({
          title: "Wallet connected",
          description: "Your MetaMask wallet has been connected successfully.",
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      <h3 className="text-lg font-medium">Wallet Connection</h3>
      {address ? (
        <div className="space-y-4">
          <div className="p-4 border rounded-md bg-muted/30">
            <p className="text-sm font-medium">Connected Wallet</p>
            <p className="text-xs text-muted-foreground mt-1 break-all">
              {address}
            </p>
          </div>
          <Button variant="outline" onClick={disconnectWallet}>
            Disconnect Wallet
          </Button>
        </div>
      ) : (
        <Button onClick={connectWallet} disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect MetaMask"}
        </Button>
      )}
    </div>
  );
};

export default ConnectWallet;
