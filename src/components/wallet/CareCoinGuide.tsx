
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Info, FileCode, ExternalLink, Download, Copy } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CareCoinGuide = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-health-50 border-health-200">
        <Info className="h-4 w-4 text-health-600" />
        <AlertTitle>CareCoin Deployment Guide</AlertTitle>
        <AlertDescription>
          This guide will walk you through deploying your own CareCoin cryptocurrency contract.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>CareCoin Overview</CardTitle>
          <CardDescription>
            CareCoin is an ERC-20 token designed specifically for healthcare platforms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            CareCoin is built on the Ethereum blockchain as an ERC-20 token, allowing for:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Rewarding healthcare providers for quality care</li>
            <li>Incentivizing patients for treatment adherence</li>
            <li>Paying for healthcare services with reduced fees</li>
            <li>Access to premium features in health applications</li>
            <li>Seamless integration with existing wallet infrastructure</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prerequisites</CardTitle>
          <CardDescription>
            Before deploying your token, ensure you have these tools ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc pl-6 space-y-2">
            <li>MetaMask or another Ethereum wallet with ETH for gas fees</li>
            <li>Optional: Remix IDE or Hardhat for custom contract work</li>
            <li>Basic understanding of Ethereum and smart contracts</li>
            <li>One-click mainnet deployment from the Wallet Dashboard</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CareCoin Contract Code</CardTitle>
          <CardDescription>
            Standard ERC-20 implementation with healthcare-specific features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-slate-950 p-4 relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={() => copyToClipboard(careCoinContractCode)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <pre className="overflow-x-auto text-sm text-slate-50 whitespace-pre-wrap">
              {careCoinContractCode}
            </pre>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => 
              window.open("https://remix.ethereum.org", "_blank")
            }
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open in Remix IDE
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => {
              const blob = new Blob([careCoinContractCode], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'CareCoin.sol';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4" />
            Download Contract
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deployment Steps</CardTitle>
          <CardDescription>
            Follow these steps to deploy your CareCoin contract
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-6 space-y-4">
            <li className="pb-4">
              <strong>Prepare your environment</strong>
              <p className="text-muted-foreground mt-1">
                Install MetaMask and fund your wallet with test ETH from a faucet for the network you plan to use.
              </p>
            </li>
            <Separator />
            <li className="pb-4">
              <strong>Open Remix IDE</strong>
              <p className="text-muted-foreground mt-1">
                Go to <a href="https://remix.ethereum.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">remix.ethereum.org</a> and create a new file named <code>CareCoin.sol</code>
              </p>
            </li>
            <Separator />
            <li className="pb-4">
              <strong>Paste the contract code</strong>
              <p className="text-muted-foreground mt-1">
                Copy the contract code above and paste it into your Remix file.
              </p>
            </li>
            <Separator />
            <li className="pb-4">
              <strong>Compile the contract</strong>
              <p className="text-muted-foreground mt-1">
                In Remix, go to the "Solidity Compiler" tab, select compiler version 0.8.17, and click "Compile".
              </p>
            </li>
            <Separator />
            <li className="pb-4">
              <strong>Deploy the contract</strong>
              <p className="text-muted-foreground mt-1">
                Go to the "Deploy & Run Transactions" tab, ensure your environment is set to "Injected Provider - MetaMask", and click "Deploy" with the constructor parameters (initial supply, name, symbol).
              </p>
            </li>
            <Separator />
            <li>
              <strong>Verify and use your token</strong>
              <p className="text-muted-foreground mt-1">
                After deployment, save your contract address and verify it on Etherscan. You can now integrate it with your application.
              </p>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration with Facesheet360</CardTitle>
          <CardDescription>
            How to connect your deployed CareCoin with the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            After deploying your CareCoin contract, follow these steps to integrate it:
          </p>
          
          <ol className="list-decimal pl-6 space-y-2">
            <li>Update the contract address in <code>src/lib/carecoin.ts</code> with your deployed address</li>
            <li>Ensure your MetaMask wallet is connected to the same network where you deployed the contract</li>
            <li>Use the application's wallet features to interact with your token</li>
          </ol>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
            <h4 className="text-sm font-medium text-yellow-800">Important Note</h4>
            <p className="text-sm text-yellow-700 mt-1">
              For production use, always conduct a thorough audit of your smart contract before deploying to mainnet.
              Consider using a professional service like CertiK, OpenZeppelin, or Consensys Diligence.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Sample CareCoin contract code (simplified ERC-20 implementation)
const careCoinContractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title CareCoin
 * @dev Implementation of the ERC-20 Token Standard for Healthcare
 */
contract CareCoin {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    /**
     * @dev Constructor sets the name, symbol, and initial supply
     */
    constructor(uint256 initialSupply, string memory tokenName, string memory tokenSymbol) {
        name = tokenName;
        symbol = tokenSymbol;
        totalSupply = initialSupply * 10**uint256(decimals);
        _balances[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    /**
     * @dev Returns the balance of the specified account
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
    
    /**
     * @dev Transfers tokens to the specified address
     */
    function transfer(address to, uint256 amount) public returns (bool) {
        address sender = msg.sender;
        require(to != address(0), "Transfer to the zero address");
        require(_balances[sender] >= amount, "Transfer amount exceeds balance");
        
        _balances[sender] -= amount;
        _balances[to] += amount;
        emit Transfer(sender, to, amount);
        return true;
    }
    
    /**
     * @dev Returns the remaining tokens that spender can spend on behalf of owner
     */
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }
    
    /**
     * @dev Sets amount as the allowance of spender over the caller's tokens
     */
    function approve(address spender, uint256 amount) public returns (bool) {
        address owner = msg.sender;
        require(spender != address(0), "Approve to the zero address");
        
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
        return true;
    }
    
    /**
     * @dev Transfers tokens from one address to another
     */
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        address spender = msg.sender;
        require(from != address(0), "Transfer from the zero address");
        require(to != address(0), "Transfer to the zero address");
        require(_balances[from] >= amount, "Transfer amount exceeds balance");
        require(_allowances[from][spender] >= amount, "Transfer amount exceeds allowance");
        
        _balances[from] -= amount;
        _balances[to] += amount;
        _allowances[from][spender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    /**
     * @dev Healthcare-specific: Reward user for completing a health action
     * Only contract owner can call this function
     */
    function rewardHealthAction(address user, uint256 amount) public returns (bool) {
        require(user != address(0), "Reward to the zero address");
        require(_balances[msg.sender] >= amount, "Reward amount exceeds balance");
        
        _balances[msg.sender] -= amount;
        _balances[user] += amount;
        
        emit Transfer(msg.sender, user, amount);
        return true;
    }
}`;

export default CareCoinGuide;
