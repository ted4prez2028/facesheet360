/**
 * Complete CareCoin Implementation
 * Full cryptocurrency functionality with all features
 */

import { ethers } from 'ethers';
import { getProvider, getSigner, getStoredContractAddress, storeContractAddress } from '../web3';
import { handleBlockchainError } from '@/utils/errorHandler';

// CareCoin Contract ABI (Complete)
export const CARECOIN_ABI = [
  // ERC-20 Standard
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // CareCoin Specific
  "function mint(address to, uint256 amount, string reason) returns (bool)",
  "function burn(uint256 amount, string reason) returns (bool)",
  "function stake(uint256 amount, uint256 lockPeriod) returns (bool)",
  "function unstake(uint256 amount) returns (bool)",
  "function claimRewards() returns (bool)",
  "function getPendingRewards(address user) view returns (uint256)",
  "function stakingInfo(address) view returns (uint256 amount, uint256 stakedAt, uint256 lockPeriod, uint256 rewardRate)",
  "function totalStaked() view returns (uint256)",
  "function dailyMintLimit() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event TokensMinted(address indexed to, uint256 amount, string reason)",
  "event TokensBurned(address indexed from, uint256 amount, string reason)",
  "event Staked(address indexed user, uint256 amount, uint256 lockPeriod)",
  "event Unstaked(address indexed user, uint256 amount, uint256 rewards)",
  "event RewardsClaimed(address indexed user, uint256 amount)",
] as const;

// Staking Contract ABI
export const STAKING_ABI = [
  "function stake(uint256 poolId, uint256 amount) returns (bool)",
  "function unstake(uint256 stakeIndex) returns (bool)",
  "function claimRewards(uint256 poolId) returns (bool)",
  "function getPendingRewards(address user, uint256 poolId) view returns (uint256)",
  "function getUserStakes(address user) view returns (tuple(uint256 poolId, uint256 amount, uint256 stakedAt, uint256 lastRewardClaim, uint256 claimedRewards)[])",
  "function pools(uint256) view returns (string name, uint256 lockPeriod, uint256 rewardRate, uint256 totalStaked, uint256 totalRewards, bool active)",
  "function getPoolCount() view returns (uint256)",
  "event Staked(address indexed user, uint256 indexed poolId, uint256 amount)",
  "event Unstaked(address indexed user, uint256 indexed poolId, uint256 amount, uint256 rewards)",
  "event RewardsClaimed(address indexed user, uint256 indexed poolId, uint256 amount)",
] as const;

/**
 * Get CareCoin contract instance
 */
export async function getCareCoinContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const contractAddress = getStoredContractAddress();
  if (!contractAddress) {
    throw new Error('CareCoin contract not deployed. Please deploy first.');
  }
  return new ethers.Contract(contractAddress, CARECOIN_ABI, signerOrProvider);
}

/**
 * Get Staking contract instance
 */
export async function getStakingContract(
  stakingAddress: string,
  signerOrProvider: ethers.Signer | ethers.Provider
) {
  return new ethers.Contract(stakingAddress, STAKING_ABI, signerOrProvider);
}

/**
 * Complete token information
 */
export interface CareCoinInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  maxSupply: bigint;
  balance: bigint;
  address: string;
  dailyMintLimit: bigint;
  totalStaked: bigint;
}

/**
 * Get complete token information
 */
export async function getCareCoinInfo(userAddress?: string): Promise<CareCoinInfo> {
  try {
    const provider = getProvider();
    if (!provider) throw new Error('Provider not available');
    
    const contract = await getCareCoinContract(provider);
    const contractAddress = getStoredContractAddress()!;
    
    const [name, symbol, decimals, totalSupply, maxSupply, dailyMintLimit, totalStaked] = 
      await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply(),
        contract.MAX_SUPPLY(),
        contract.dailyMintLimit(),
        contract.totalStaked(),
      ]);
    
    let balance = 0n;
    if (userAddress) {
      balance = await contract.balanceOf(userAddress);
    }
    
    return {
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply,
      maxSupply,
      balance,
      address: contractAddress,
      dailyMintLimit,
      totalStaked,
    };
  } catch (error) {
    throw handleBlockchainError(error, 'getCareCoinInfo');
  }
}

/**
 * Transfer CareCoins
 */
export async function transferCareCoins(
  to: string,
  amount: string,
  options?: { gasPrice?: bigint; gasLimit?: bigint }
) {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('Signer not available');
    
    const contract = await getCareCoinContract(signer);
    const amountWei = ethers.parseEther(amount);
    
    const tx = await contract.transfer(to, amountWei, options);
    return await tx.wait();
  } catch (error) {
    throw handleBlockchainError(error, 'transferCareCoins');
  }
}

/**
 * Approve spender
 */
export async function approveCareCoins(
  spender: string,
  amount: string,
  options?: { gasPrice?: bigint; gasLimit?: bigint }
) {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('Signer not available');
    
    const contract = await getCareCoinContract(signer);
    const amountWei = ethers.parseEther(amount);
    
    const tx = await contract.approve(spender, amountWei, options);
    return await tx.wait();
  } catch (error) {
    throw handleBlockchainError(error, 'approveCareCoins');
  }
}

/**
 * Stake CareCoins (simple staking)
 */
export async function stakeCareCoins(
  amount: string,
  lockPeriod?: number, // in seconds, 0 for default
  options?: { gasPrice?: bigint; gasLimit?: bigint }
) {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('Signer not available');
    
    const contract = await getCareCoinContract(signer);
    const amountWei = ethers.parseEther(amount);
    const lock = lockPeriod ? BigInt(lockPeriod) : 0n;
    
    const tx = await contract.stake(amountWei, lock, options);
    return await tx.wait();
  } catch (error) {
    throw handleBlockchainError(error, 'stakeCareCoins');
  }
}

/**
 * Unstake CareCoins
 */
export async function unstakeCareCoins(
  amount: string,
  options?: { gasPrice?: bigint; gasLimit?: bigint }
) {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('Signer not available');
    
    const contract = await getCareCoinContract(signer);
    const amountWei = ethers.parseEther(amount);
    
    const tx = await contract.unstake(amountWei, options);
    return await tx.wait();
  } catch (error) {
    throw handleBlockchainError(error, 'unstakeCareCoins');
  }
}

/**
 * Claim staking rewards
 */
export async function claimStakingRewards(options?: { gasPrice?: bigint; gasLimit?: bigint }) {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('Signer not available');
    
    const contract = await getCareCoinContract(signer);
    const tx = await contract.claimRewards(options);
    return await tx.wait();
  } catch (error) {
    throw handleBlockchainError(error, 'claimStakingRewards');
  }
}

/**
 * Get staking information
 */
export interface StakingInfo {
  amount: bigint;
  stakedAt: bigint;
  lockPeriod: bigint;
  rewardRate: bigint;
  pendingRewards: bigint;
  canUnstake: boolean;
}

export async function getStakingInfo(userAddress: string): Promise<StakingInfo | null> {
  try {
    const provider = getProvider();
    if (!provider) throw new Error('Provider not available');
    
    const contract = await getCareCoinContract(provider);
    const [stakingData, pendingRewards] = await Promise.all([
      contract.stakingInfo(userAddress),
      contract.getPendingRewards(userAddress),
    ]);
    
    if (stakingData.amount === 0n) return null;
    
    const canUnstake = BigInt(Date.now()) / 1000n >= stakingData.stakedAt + stakingData.lockPeriod;
    
    return {
      amount: stakingData.amount,
      stakedAt: stakingData.stakedAt,
      lockPeriod: stakingData.lockPeriod,
      rewardRate: stakingData.rewardRate,
      pendingRewards,
      canUnstake,
    };
  } catch (error) {
    throw handleBlockchainError(error, 'getStakingInfo');
  }
}

/**
 * Advanced Staking Pool Operations
 */
export interface StakingPool {
  id: number;
  name: string;
  lockPeriod: bigint;
  rewardRate: bigint;
  totalStaked: bigint;
  totalRewards: bigint;
  active: boolean;
}

export async function getStakingPools(stakingAddress: string): Promise<StakingPool[]> {
  try {
    const provider = getProvider();
    if (!provider) throw new Error('Provider not available');
    
    const stakingContract = await getStakingContract(stakingAddress, provider);
    const poolCount = await stakingContract.getPoolCount();
    
    const pools: StakingPool[] = [];
    for (let i = 0; i < Number(poolCount); i++) {
      const pool = await stakingContract.pools(i);
      pools.push({
        id: i,
        name: pool.name,
        lockPeriod: pool.lockPeriod,
        rewardRate: pool.rewardRate,
        totalStaked: pool.totalStaked,
        totalRewards: pool.totalRewards,
        active: pool.active,
      });
    }
    
    return pools;
  } catch (error) {
    throw handleBlockchainError(error, 'getStakingPools');
  }
}

/**
 * Stake in a specific pool
 */
export async function stakeInPool(
  stakingAddress: string,
  poolId: number,
  amount: string,
  options?: { gasPrice?: bigint; gasLimit?: bigint }
) {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('Signer not available');
    
    const stakingContract = await getStakingContract(stakingAddress, signer);
    const amountWei = ethers.parseEther(amount);
    
    const tx = await stakingContract.stake(poolId, amountWei, options);
    return await tx.wait();
  } catch (error) {
    throw handleBlockchainError(error, 'stakeInPool');
  }
}

/**
 * Get user's stakes in all pools
 */
export interface UserStake {
  poolId: number;
  amount: bigint;
  stakedAt: bigint;
  lastRewardClaim: bigint;
  claimedRewards: bigint;
  pendingRewards: bigint;
  poolName: string;
  canUnstake: boolean;
}

export async function getUserStakes(
  stakingAddress: string,
  userAddress: string
): Promise<UserStake[]> {
  try {
    const provider = getProvider();
    if (!provider) throw new Error('Provider not available');
    
    const stakingContract = await getStakingContract(stakingAddress, provider);
    const [stakes, pools] = await Promise.all([
      stakingContract.getUserStakes(userAddress),
      getStakingPools(stakingAddress),
    ]);
    
    const userStakes: UserStake[] = [];
    for (const stake of stakes) {
      const pool = pools[Number(stake.poolId)];
      const pendingRewards = await stakingContract.getPendingRewards(userAddress, stake.poolId);
      const canUnstake = pool.lockPeriod === 0n || 
        (BigInt(Date.now()) / 1000n >= stake.stakedAt + pool.lockPeriod);
      
      userStakes.push({
        poolId: Number(stake.poolId),
        amount: stake.amount,
        stakedAt: stake.stakedAt,
        lastRewardClaim: stake.lastRewardClaim,
        claimedRewards: stake.claimedRewards,
        pendingRewards,
        poolName: pool.name,
        canUnstake,
      });
    }
    
    return userStakes;
  } catch (error) {
    throw handleBlockchainError(error, 'getUserStakes');
  }
}

/**
 * Listen to CareCoin events
 */
export async function listenToCareCoinEvents(
  callback: (event: { type: string; data: unknown }) => void
) {
  try {
    const provider = getProvider();
    if (!provider) throw new Error('Provider not available');
    
    const contract = await getCareCoinContract(provider);
    const contractAddress = getStoredContractAddress()!;
    
    // Listen to Transfer events
    contract.on('Transfer', (from, to, value, event) => {
      callback({
        type: 'Transfer',
        data: {
          from,
          to,
          value: value.toString(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        },
      });
    });
    
    // Listen to Staked events
    contract.on('Staked', (user, amount, lockPeriod, event) => {
      callback({
        type: 'Staked',
        data: {
          user,
          amount: amount.toString(),
          lockPeriod: lockPeriod.toString(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        },
      });
    });
    
    // Listen to RewardsClaimed events
    contract.on('RewardsClaimed', (user, amount, event) => {
      callback({
        type: 'RewardsClaimed',
        data: {
          user,
          amount: amount.toString(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        },
      });
    });
    
    return () => {
      contract.removeAllListeners();
    };
  } catch (error) {
    throw handleBlockchainError(error, 'listenToCareCoinEvents');
  }
}

/**
 * Estimate gas for transaction
 */
export async function estimateGas(
  functionName: string,
  ...args: unknown[]
): Promise<bigint> {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('Signer not available');
    
    const contract = await getCareCoinContract(signer);
    const estimate = await contract[functionName].estimateGas(...args);
    return estimate;
  } catch (error) {
    throw handleBlockchainError(error, 'estimateGas');
  }
}

