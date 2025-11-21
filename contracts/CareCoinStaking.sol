// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./CareCoin.sol";

/**
 * @title CareCoinStaking
 * @dev Advanced staking contract with multiple pools and flexible rewards
 */
contract CareCoinStaking is ReentrancyGuard, AccessControl {
    bytes32 public constant REWARD_MANAGER_ROLE = keccak256("REWARD_MANAGER_ROLE");
    
    CareCoin public careCoin;
    
    struct StakingPool {
        string name;
        uint256 lockPeriod; // in seconds
        uint256 rewardRate; // APY in basis points
        uint256 totalStaked;
        uint256 totalRewards;
        bool active;
    }
    
    struct UserStake {
        uint256 poolId;
        uint256 amount;
        uint256 stakedAt;
        uint256 lastRewardClaim;
        uint256 claimedRewards;
    }
    
    StakingPool[] public pools;
    mapping(address => UserStake[]) public userStakes;
    mapping(address => mapping(uint256 => uint256)) public userPoolStakes; // user => poolId => amount
    
    event PoolCreated(uint256 indexed poolId, string name, uint256 lockPeriod, uint256 rewardRate);
    event Staked(address indexed user, uint256 indexed poolId, uint256 amount);
    event Unstaked(address indexed user, uint256 indexed poolId, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 indexed poolId, uint256 amount);
    event PoolUpdated(uint256 indexed poolId, uint256 newRewardRate);
    
    constructor(address _careCoin, address admin) {
        careCoin = CareCoin(_careCoin);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REWARD_MANAGER_ROLE, admin);
        
        // Create default pools
        _createPool("Flexible", 0, 600); // 6% APY, no lock
        _createPool("30 Day", 30 days, 1200); // 12% APY, 30 day lock
        _createPool("90 Day", 90 days, 1800); // 18% APY, 90 day lock
        _createPool("180 Day", 180 days, 2400); // 24% APY, 180 day lock
        _createPool("365 Day", 365 days, 3600); // 36% APY, 365 day lock
    }
    
    function _createPool(string memory name, uint256 lockPeriod, uint256 rewardRate) internal {
        pools.push(StakingPool({
            name: name,
            lockPeriod: lockPeriod,
            rewardRate: rewardRate,
            totalStaked: 0,
            totalRewards: 0,
            active: true
        }));
        emit PoolCreated(pools.length - 1, name, lockPeriod, rewardRate);
    }
    
    function createPool(string memory name, uint256 lockPeriod, uint256 rewardRate) 
        public 
        onlyRole(REWARD_MANAGER_ROLE) 
    {
        require(rewardRate <= 5000, "Reward rate too high"); // Max 50% APY
        _createPool(name, lockPeriod, rewardRate);
    }
    
    function stake(uint256 poolId, uint256 amount) public nonReentrant {
        require(poolId < pools.length, "Invalid pool");
        StakingPool storage pool = pools[poolId];
        require(pool.active, "Pool not active");
        require(amount > 0, "Amount must be greater than 0");
        
        // Claim existing rewards for this pool
        _claimRewards(msg.sender, poolId);
        
        // Transfer tokens
        require(careCoin.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Update stakes
        userStakes[msg.sender].push(UserStake({
            poolId: poolId,
            amount: amount,
            stakedAt: block.timestamp,
            lastRewardClaim: block.timestamp,
            claimedRewards: 0
        }));
        
        userPoolStakes[msg.sender][poolId] += amount;
        pool.totalStaked += amount;
        
        emit Staked(msg.sender, poolId, amount);
    }
    
    function unstake(uint256 stakeIndex) public nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        UserStake storage userStake = userStakes[msg.sender][stakeIndex];
        StakingPool storage pool = pools[userStake.poolId];
        
        require(
            block.timestamp >= userStake.stakedAt + pool.lockPeriod,
            "Lock period not expired"
        );
        
        // Claim rewards first
        _claimRewards(msg.sender, userStake.poolId);
        
        uint256 amount = userStake.amount;
        uint256 rewards = userStake.claimedRewards;
        
        // Remove stake
        userPoolStakes[msg.sender][userStake.poolId] -= amount;
        pool.totalStaked -= amount;
        
        // Remove from array (swap with last and pop)
        uint256 lastIndex = userStakes[msg.sender].length - 1;
        if (stakeIndex != lastIndex) {
            userStakes[msg.sender][stakeIndex] = userStakes[msg.sender][lastIndex];
        }
        userStakes[msg.sender].pop();
        
        // Transfer tokens back
        require(careCoin.transfer(msg.sender, amount), "Transfer failed");
        
        emit Unstaked(msg.sender, userStake.poolId, amount, rewards);
    }
    
    function claimRewards(uint256 poolId) public nonReentrant {
        _claimRewards(msg.sender, poolId);
    }
    
    function _claimRewards(address user, uint256 poolId) internal {
        uint256 totalRewards = 0;
        
        for (uint256 i = 0; i < userStakes[user].length; i++) {
            if (userStakes[user][i].poolId == poolId) {
                UserStake storage userStake = userStakes[user][i];
                StakingPool storage pool = pools[poolId];
                
                uint256 timeStaked = block.timestamp - userStake.lastRewardClaim;
                uint256 rewards = (userStake.amount * pool.rewardRate * timeStaked) / (365 days * 10000);
                
                if (rewards > 0) {
                    totalRewards += rewards;
                    userStake.claimedRewards += rewards;
                    userStake.lastRewardClaim = block.timestamp;
                }
            }
        }
        
        if (totalRewards > 0) {
            pools[poolId].totalRewards += totalRewards;
            careCoin.mint(user, totalRewards, "Staking rewards");
            emit RewardsClaimed(user, poolId, totalRewards);
        }
    }
    
    function getPendingRewards(address user, uint256 poolId) public view returns (uint256) {
        uint256 totalRewards = 0;
        
        for (uint256 i = 0; i < userStakes[user].length; i++) {
            if (userStakes[user][i].poolId == poolId) {
                UserStake memory userStake = userStakes[user][i];
                StakingPool memory pool = pools[poolId];
                
                uint256 timeStaked = block.timestamp - userStake.lastRewardClaim;
                uint256 rewards = (userStake.amount * pool.rewardRate * timeStaked) / (365 days * 10000);
                totalRewards += rewards;
            }
        }
        
        return totalRewards;
    }
    
    function getUserStakes(address user) public view returns (UserStake[] memory) {
        return userStakes[user];
    }
    
    function getPoolCount() public view returns (uint256) {
        return pools.length;
    }
    
    function updatePoolRewardRate(uint256 poolId, uint256 newRate) 
        public 
        onlyRole(REWARD_MANAGER_ROLE) 
    {
        require(poolId < pools.length, "Invalid pool");
        require(newRate <= 5000, "Reward rate too high");
        pools[poolId].rewardRate = newRate;
        emit PoolUpdated(poolId, newRate);
    }
    
    function togglePool(uint256 poolId) public onlyRole(REWARD_MANAGER_ROLE) {
        require(poolId < pools.length, "Invalid pool");
        pools[poolId].active = !pools[poolId].active;
    }
}

