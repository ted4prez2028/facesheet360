import { ethers } from 'ethers';

export interface WalletConnection {
  address: string;
  balance: string;
  chainId: number;
  provider: ethers.BrowserProvider;
}

export interface CareCoinTransaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  type: 'transfer' | 'reward' | 'payment';
  timestamp: number;
}

class CareWallet {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contractAddress = "0xYourCareCoinContractAddressHere";
  
  // CareCoin contract ABI
  private contractABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function totalSupply() view returns (uint256)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
  ];

  async connectWallet(): Promise<WalletConnection | null> {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not detected');
      }

      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      await this.provider.send("eth_requestAccounts", []);
      
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();
      const balance = await this.getCareCoinBalance(address);
      const network = await this.provider.getNetwork();

      return {
        address,
        balance,
        chainId: Number(network.chainId),
        provider: this.provider
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    }
  }

  async getCareCoinBalance(address: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        this.provider
      );

      const balance = await contract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting CareCoin balance:', error);
      return '0';
    }
  }

  async transferCareCoin(toAddress: string, amount: string): Promise<string | null> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        this.signer
      );

      const amountWei = ethers.parseEther(amount);
      const transaction = await contract.transfer(toAddress, amountWei);
      
      return transaction.hash;
    } catch (error) {
      console.error('Error transferring CareCoin:', error);
      return null;
    }
  }

  async generateWalletConnectQR(): Promise<string> {
    // Generate a WalletConnect-style connection request
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const connectionData = {
      protocol: 'wc',
      version: '2.0',
      topic: sessionId,
      relay: {
        protocol: 'irn'
      },
      methods: [
        'eth_sendTransaction',
        'eth_signTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData'
      ],
      events: ['chainChanged', 'accountsChanged'],
      metadata: {
        name: 'Facesheet360 - CareCoin',
        description: 'Healthcare blockchain wallet for CareCoin',
        url: window.location.origin,
        icons: ['https://facesheet360.com/icon.png']
      }
    };

    // In a real implementation, this would be a proper WalletConnect URI
    return `wc:${sessionId}@2?${new URLSearchParams({
      relay: JSON.stringify(connectionData.relay),
      methods: connectionData.methods.join(','),
      events: connectionData.events.join(',')
    }).toString()}`;
  }

  async getTransactionHistory(address: string, limit = 10): Promise<CareCoinTransaction[]> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        this.provider
      );

      // Get Transfer events for this address
      const filter = contract.filters.Transfer(address, null);
      const events = await contract.queryFilter(filter, -1000); // Last 1000 blocks

      const transactions: CareCoinTransaction[] = [];

      for (const event of events.slice(-limit)) {
        const block = await this.provider.getBlock(event.blockNumber);
        
        // Type guard to check if event is EventLog
        if ('args' in event && event.args) {
          transactions.push({
            hash: event.transactionHash,
            from: event.args[0] || '',
            to: event.args[1] || '',
            amount: ethers.formatEther(event.args[2] || 0),
            type: 'transfer',
            timestamp: block ? block.timestamp * 1000 : Date.now()
          });
        }
      }

      return transactions.reverse(); // Most recent first
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  disconnect(): void {
    this.provider = null;
    this.signer = null;
  }

  isConnected(): boolean {
    return this.provider !== null && this.signer !== null;
  }

  async addCareCoinToWallet(): Promise<boolean> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const wasAdded = await this.provider.send('wallet_watchAsset', {
        type: 'ERC20',
        options: {
          address: this.contractAddress,
          symbol: 'CARE',
          decimals: 18,
          image: 'https://facesheet360.com/carecoin-logo.png',
        },
      });

      return wasAdded;
    } catch (error) {
      console.error('Error adding CareCoin to wallet:', error);
      return false;
    }
  }
}

export const careWallet = new CareWallet();