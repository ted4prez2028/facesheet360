import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

export const getSigner = async () => {
  const provider = getProvider();
  if (provider) {
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    return signer;
  }
  return null;
};

export const getCareCoinContract = async (signerOrProvider: ethers.Signer | ethers.Provider) => {
  // Replace with your deployed CareCoin contract address and ABI
  const contractAddress = "0xYourCareCoinContractAddressHere"; 
  const contractABI = [
    // ERC-20 Standard ABI for transfer and balanceOf
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    // Staking functions
    "function stake(uint256 amount) public",
    "function unstake(uint256 amount) public",
    // Minting function (callable by authorized minter only)
    "function mint(address to, uint256 amount, string metadataHash) public",
    // Events for staking and minting
    "event Staked(address indexed user, uint256 amount)",
    "event Unstaked(address indexed user, uint256 amount)",
    "event Minted(address indexed to, uint256 amount, string metadataHash)"
  ];
  return new ethers.Contract(contractAddress, contractABI, signerOrProvider);
};
