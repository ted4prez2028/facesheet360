// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./CareCoin.sol";

/**
 * @title CareCoinNFT
 * @dev NFT rewards for healthcare achievements
 */
contract CareCoinNFT is ERC721, ERC721URIStorage, ERC721Enumerable, AccessControl {
    using Counters for Counters.Counter;
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    
    Counters.Counter private _tokenIdCounter;
    CareCoin public careCoin;
    
    // Achievement types
    enum AchievementType {
        CHARTING_MILESTONE,      // 100 charts completed
        PATIENT_CARE,            // Excellent patient care
        RESEARCH_CONTRIBUTION,    // Research participation
        TRAINING_COMPLETION,     // Training completed
        COMMUNITY_SERVICE,       // Community service
        INNOVATION,              // Innovation award
        LEADERSHIP,              // Leadership recognition
        LIFETIME_ACHIEVEMENT     // Lifetime achievement
    }
    
    struct Achievement {
        AchievementType achievementType;
        string title;
        string description;
        uint256 rewardAmount; // CareCoin reward
        uint256 mintedAt;
        address recipient;
    }
    
    mapping(uint256 => Achievement) public achievements;
    mapping(address => uint256[]) public userAchievements;
    mapping(AchievementType => uint256) public achievementRewards;
    
    event AchievementMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        AchievementType achievementType,
        uint256 rewardAmount
    );
    
    constructor(address _careCoin, address admin) ERC721("CareCoin Achievement", "CAREACH") {
        careCoin = CareCoin(_careCoin);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(BURNER_ROLE, admin);
        
        // Set default rewards for each achievement type
        achievementRewards[AchievementType.CHARTING_MILESTONE] = 100 * 10**18; // 100 CARE
        achievementRewards[AchievementType.PATIENT_CARE] = 500 * 10**18; // 500 CARE
        achievementRewards[AchievementType.RESEARCH_CONTRIBUTION] = 1000 * 10**18; // 1000 CARE
        achievementRewards[AchievementType.TRAINING_COMPLETION] = 200 * 10**18; // 200 CARE
        achievementRewards[AchievementType.COMMUNITY_SERVICE] = 300 * 10**18; // 300 CARE
        achievementRewards[AchievementType.INNOVATION] = 2000 * 10**18; // 2000 CARE
        achievementRewards[AchievementType.LEADERSHIP] = 1500 * 10**18; // 1500 CARE
        achievementRewards[AchievementType.LIFETIME_ACHIEVEMENT] = 10000 * 10**18; // 10000 CARE
    }
    
    /**
     * @dev Mint achievement NFT and reward CareCoins
     */
    function mintAchievement(
        address to,
        AchievementType achievementType,
        string memory title,
        string memory description,
        string memory tokenURI
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        uint256 rewardAmount = achievementRewards[achievementType];
        
        // Mint NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Record achievement
        achievements[tokenId] = Achievement({
            achievementType: achievementType,
            title: title,
            description: description,
            rewardAmount: rewardAmount,
            mintedAt: block.timestamp,
            recipient: to
        });
        
        userAchievements[to].push(tokenId);
        
        // Mint CareCoin reward
        if (rewardAmount > 0) {
            careCoin.mint(to, rewardAmount, string(abi.encodePacked("Achievement reward: ", title)));
        }
        
        emit AchievementMinted(to, tokenId, achievementType, rewardAmount);
        
        return tokenId;
    }
    
    /**
     * @dev Get user's achievements
     */
    function getUserAchievements(address user) public view returns (uint256[] memory) {
        return userAchievements[user];
    }
    
    /**
     * @dev Get achievement details
     */
    function getAchievement(uint256 tokenId) public view returns (Achievement memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return achievements[tokenId];
    }
    
    /**
     * @dev Set reward amount for achievement type
     */
    function setAchievementReward(AchievementType achievementType, uint256 rewardAmount) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        achievementRewards[achievementType] = rewardAmount;
    }
    
    /**
     * @dev Burn NFT (only burner role)
     */
    function burn(uint256 tokenId) public onlyRole(BURNER_ROLE) {
        _burn(tokenId);
    }
    
    // Required overrides
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}

