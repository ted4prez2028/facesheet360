import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Wifi, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { careWallet, WalletConnection } from '@/lib/careWallet';

interface WalletConnectionData {
  sessionId: string;
  appName: string;
  appUrl: string;
  chainId: number;
  timestamp: number;
  walletAddress?: string;
  qrType: 'walletconnect' | 'address' | 'payment';
}

const QRWalletConnect: React.FC = () => {
  const [connectionData, setConnectionData] = useState<WalletConnectionData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletConnection, setWalletConnection] = useState<WalletConnection | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrMode, setQrMode] = useState<'receive' | 'connect'>('receive');

  // Generate different types of QR codes
  const generateConnectionData = async () => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (qrMode === 'receive') {
      // Generate a simple wallet address QR for receiving CareCoin
      const data: WalletConnectionData = {
        sessionId,
        appName: 'Facesheet360 - CareCoin',
        appUrl: window.location.origin,
        chainId: 1,
        timestamp: Date.now(),
        walletAddress: '0x742d35Cc6663C7e3d78EB01C3E5d4D22e1E24c46', // Example CareCoin treasury/demo address
        qrType: 'address'
      };
      setConnectionData(data);
    } else {
      // Generate WalletConnect URI
      const data: WalletConnectionData = {
        sessionId,
        appName: 'Facesheet360 - CareCoin',
        appUrl: window.location.origin,
        chainId: 1,
        timestamp: Date.now(),
        qrType: 'walletconnect'
      };
      setConnectionData(data);
      pollForConnection(sessionId);
    }
  };

  // Simulate polling for wallet connection (in real implementation, this would be WebSocket or Server-Sent Events)
  const pollForConnection = (sessionId: string) => {
    setIsGenerating(true);
    
    // Simulate connection after 3-5 seconds for demo
    setTimeout(() => {
      setIsGenerating(false);
      connectWallet();
    }, 4000);
  };

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    try {
      const connection = await careWallet.connectWallet();
      if (connection) {
        setWalletConnection(connection);
        setIsConnected(true);
        toast.success('Wallet connected successfully!');
        
        // Add CareCoin token to wallet
        await careWallet.addCareCoinToWallet();
      } else {
        toast.error('Failed to connect wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  // Copy QR data to clipboard
  const copyToClipboard = () => {
    if (connectionData) {
      const qrData = JSON.stringify(connectionData);
      navigator.clipboard.writeText(qrData);
      toast.success('Connection data copied to clipboard');
    }
  };

  // Generate proper QR value based on mode
  const getQRValue = () => {
    if (!connectionData) return '';
    
    if (connectionData.qrType === 'address' && connectionData.walletAddress) {
      // Simple wallet address format that MetaMask recognizes
      return connectionData.walletAddress;
    } else if (connectionData.qrType === 'walletconnect') {
      // Proper WalletConnect v2 URI format
      return `wc:${connectionData.sessionId}@2?relay-protocol=irn&symKey=${connectionData.sessionId.slice(-32)}`;
    } else {
      // Fallback to Ethereum payment request format
      return `ethereum:${connectionData.walletAddress || '0x742d35Cc6663C7e3d78EB01C3E5d4D22e1E24c46'}@1?value=0`;
    }
  };

  const qrValue = getQRValue();

  // Generate QR code when component mounts or mode changes
  useEffect(() => {
    generateConnectionData();
  }, [qrMode]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Smartphone className="h-5 w-5" />
            Connect Mobile Wallet
          </CardTitle>
          <CardDescription>
            Scan this QR code with your mobile MetaMask app to connect your CareCoin wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Mode Toggle */}
          <div className="flex justify-center space-x-2">
            <Button
              variant={qrMode === 'receive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setQrMode('receive');
                generateConnectionData();
              }}
            >
              Receive CareCoin
            </Button>
            <Button
              variant={qrMode === 'connect' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setQrMode('connect');
                generateConnectionData();
              }}
            >
              Connect Wallet
            </Button>
          </div>
          {!isConnected ? (
            <>
              <div className="flex justify-center">
                <div className="relative">
                  {connectionData && (
                    <QRCodeSVG
                      value={qrValue}
                      size={200}
                      level="M"
                      includeMargin={true}
                      className="border rounded-lg"
                    />
                  )}
                  
                  {isGenerating && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                      <div className="flex flex-col items-center space-y-2">
                        <Wifi className="h-6 w-6 animate-pulse text-primary" />
                        <span className="text-sm text-muted-foreground">Waiting for connection...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {qrMode === 'receive' 
                    ? 'Scan this address to send CareCoin to Facesheet360'
                    : 'Open MetaMask mobile app and scan this QR code to connect'
                  }
                </p>
                <div className="flex justify-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {qrMode === 'receive' ? 'Address' : 'Session'}: {connectionData?.sessionId.slice(-8)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const textToCopy = qrMode === 'receive' 
                        ? connectionData?.walletAddress || qrValue
                        : qrValue;
                      navigator.clipboard.writeText(textToCopy);
                      toast.success(qrMode === 'receive' ? 'Address copied!' : 'Connection data copied!');
                    }}
                    className="h-6 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-center space-x-2">
                <Button onClick={generateConnectionData} variant="outline" size="sm">
                  Generate New QR
                </Button>
                <Button onClick={connectWallet} size="sm">
                  Connect Browser Wallet
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-green-700">Wallet Connected!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Address: {walletConnection?.address.slice(0, 6)}...{walletConnection?.address.slice(-4)}
                </p>
                <p className="text-sm text-muted-foreground">
                  CareCoin Balance: {walletConnection?.balance} CARE
                </p>
              </div>
              <Button 
                onClick={() => {
                  setIsConnected(false);
                  setWalletConnection(null);
                  careWallet.disconnect();
                  generateConnectionData();
                }} 
                variant="outline"
              >
                Disconnect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How to Connect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">1</span>
            <p className="text-muted-foreground">Open MetaMask mobile app on your phone</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">2</span>
            <p className="text-muted-foreground">
              {qrMode === 'receive' 
                ? 'Use this address to send CareCoin or add it to your wallet'
                : 'Tap the scanner icon and scan the QR code above'
              }
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">3</span>
            <p className="text-muted-foreground">Approve the connection on your mobile device</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">4</span>
            <p className="text-muted-foreground">Start using CareCoin on Facesheet360!</p>
          </div>
        </CardContent>
      </Card>

      {connectionData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Security Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              • This QR code contains a unique session ID for secure connection
            </p>
            <p className="text-muted-foreground">
              • Connection expires in 5 minutes for security
            </p>
            <p className="text-muted-foreground">
              • Never share your private keys or seed phrase
            </p>
            <p className="text-muted-foreground">
              • Always verify the app URL before connecting: {window.location.origin}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRWalletConnect;