// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CareCoin
 * @dev Complete ERC-20 token implementation for healthcare rewards
 * Features: Minting, Burning, Pausable, Role-based access, Staking, Governance
 */
contract CareCoin is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    // Tokenomics
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million initial
    uint256 public constant REWARD_POOL = 500_000_000 * 10**18; // 50% for rewards
    uint256 public constant LIQUIDITY_POOL = 200_000_000 * 10**18; // 20% for liquidity
    uint256 public constant TEAM_POOL = 100_000_000 * 10**18; // 10% for team (vested)
    uint256 public constant TREASURY_POOL = 100_000_000 * 10**18; // 10% for treasury
    
    // Staking
    struct StakingInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 lockPeriod; // in seconds
        uint256 rewardRate; // APY in basis points (10000 = 100%)
    }
    
    mapping(address => StakingInfo) public stakingInfo;
    mapping(address => uint256) public stakingRewards;
    uint256 public totalStaked;
    uint256 public defaultLockPeriod = 30 days;
    uint256 public defaultRewardRate = 1200; // 12% APY
    
    // Minting limits
    uint256 public dailyMintLimit = 1_000_000 * 10**18; // 1M tokens per day
    uint256 public mintedToday;
    uint256 public lastMintDate;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 amount);
    event MintLimitUpdated(uint256 newLimit);
    event RewardRateUpdated(uint256 newRate);
    
    constructor(
        address admin,
        address treasury,
        address liquidityPool
    ) ERC20("CareCoin", "CARE") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(BURNER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(GOVERNANCE_ROLE, admin);
        
        // Initial distribution
        _mint(admin, INITIAL_SUPPLY);
        _mint(treasury, TREASURY_POOL);
        _mint(liquidityPool, LIQUIDITY_POOL);
        
        lastMintDate = block.timestamp;
    }
    
    /**
     * @dev Mint tokens (only minter role)
     * @param to Address to mint to
     * @param amount Amount to mint
     * @param reason Reason for minting (for audit)
     */
    function mint(address to, uint256 amount, string memory reason) 
        public 
        onlyRole(MINTER_ROLE) 
        whenNotPaused 
        nonReentrant 
    {
        require(to != address(0), "CareCoin: mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "CareCoin: exceeds max supply");
        
        // Daily mint limit
        if (block.timestamp >= lastMintDate + 1 days) {
            mintedToday = 0;
            lastMintDate = block.timestamp;
        }
        require(mintedToday + amount <= dailyMintLimit, "CareCoin: exceeds daily limit");
        
        mintedToday += amount;
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }
    
    /**
     * @dev Burn tokens (only burner role or token holder)
     * @param amount Amount to burn
     * @param reason Reason for burning
     */
    function burn(uint256 amount, string memory reason) 
        public 
        override 
        whenNotPaused 
    {
        require(
            hasRole(BURNER_ROLE, msg.sender) || msg.sender == address(this),
            "CareCoin: not authorized to burn"
        );
        super.burn(amount);
        emit TokensBurned(msg.sender, amount, reason);
    }
    
    /**
     * @dev Stake tokens to earn rewards
     * @param amount Amount to stake
     * @param lockPeriod Lock period in seconds (0 = use default)
     */
    function stake(uint256 amount, uint256 lockPeriod) 
        public 
        whenNotPaused 
        nonReentrant 
    {
        require(amount > 0, "CareCoin: amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "CareCoin: insufficient balance");
        
        // Claim existing rewards if staking again
        if (stakingInfo[msg.sender].amount > 0) {
            _claimRewards();
        }
        
        uint256 lock = lockPeriod > 0 ? lockPeriod : defaultLockPeriod;
        stakingInfo[msg.sender] = StakingInfo({
            amount: stakingInfo[msg.sender].amount + amount,
            stakedAt: block.timestamp,
            lockPeriod: lock,
            rewardRate: defaultRewardRate
        });
        
        totalStaked += amount;
        _transfer(msg.sender, address(this), amount);
        
        emit Staked(msg.sender, amount, lock);
    }
    
    /**
     * @dev Unstake tokens
     * @param amount Amount to unstake
     */
    function unstake(uint256 amount) 
        public 
        whenNotPaused 
        nonReentrant 
    {
        StakingInfo memory info = stakingInfo[msg.sender];
        require(info.amount >= amount, "CareCoin: insufficient staked amount");
        require(
            block.timestamp >= info.stakedAt + info.lockPeriod,
            "CareCoin: lock period not expired"
        );
        
        // Claim rewards first
        _claimRewards();
        
        stakingInfo[msg.sender].amount -= amount;
        totalStaked -= amount;
        
        if (stakingInfo[msg.sender].amount == 0) {
            delete stakingInfo[msg.sender];
        }
        
        _transfer(address(this), msg.sender, amount);
        emit Unstaked(msg.sender, amount, stakingRewards[msg.sender]);
    }
    
    /**
     * @dev Claim staking rewards
     */
    function claimRewards() public whenNotPaused nonReentrant {
        _claimRewards();
    }
    
    /**
     * @dev Internal function to calculate and claim rewards
     */
    function _claimRewards() internal {
        StakingInfo memory info = stakingInfo[msg.sender];
        if (info.amount == 0) return;
        
        uint256 stakingDuration = block.timestamp - info.stakedAt;
        uint256 rewards = (info.amount * info.rewardRate * stakingDuration) / (365 days * 10000);
        
        if (rewards > 0) {
            stakingRewards[msg.sender] += rewards;
            _mint(msg.sender, rewards);
            emit RewardsClaimed(msg.sender, rewards);
        }
        
        stakingInfo[msg.sender].stakedAt = block.timestamp; // Reset timer
    }
    
    /**
     * @dev Get pending rewards for a user
     */
    function getPendingRewards(address user) public view returns (uint256) {
        StakingInfo memory info = stakingInfo[user];
        if (info.amount == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - info.stakedAt;
        return (info.amount * info.rewardRate * stakingDuration) / (365 days * 10000);
    }
    
    /**
     * @dev Update daily mint limit (governance only)
     */
    function setDailyMintLimit(uint256 newLimit) public onlyRole(GOVERNANCE_ROLE) {
        dailyMintLimit = newLimit;
        emit MintLimitUpdated(newLimit);
    }
    
    /**
     * @dev Update default reward rate (governance only)
     */
    function setDefaultRewardRate(uint256 newRate) public onlyRole(GOVERNANCE_ROLE) {
        require(newRate <= 5000, "CareCoin: reward rate too high"); // Max 50% APY
        defaultRewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }
    
    /**
     * @dev Pause all token operations
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause token operations
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Override required by Solidity
     */
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}

