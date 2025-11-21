/**
 * CareCoin Price Oracle
 * Real-time price feeds from multiple sources
 */

import { ethers } from 'ethers';
import { getProvider } from '../web3';
import { handleBlockchainError } from '@/utils/errorHandler';

// Chainlink Price Feed ABI
const CHAINLINK_PRICE_FEED_ABI = [
  "function latestRoundData() external view returns (uint80 roundId, int256 price, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function decimals() external view returns (uint8)",
] as const;

// Chainlink Aggregator V3 Interface
const CHAINLINK_AGGREGATOR_ABI = [
  "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function getRoundData(uint80 _roundId) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
] as const;

/**
 * Price Oracle Sources
 */
export enum PriceSource {
  CHAINLINK = 'chainlink',
  UNISWAP = 'uniswap',
  COINGECKO = 'coingecko',
  COINMARKETCAP = 'coinmarketcap',
}

/**
 * Price data structure
 */
export interface PriceData {
  price: number;
  source: PriceSource;
  timestamp: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
  liquidity?: number;
}

/**
 * Get price from Chainlink Oracle
 */
async function getChainlinkPrice(
  feedAddress: string,
  decimals: number = 8
): Promise<{ price: number; timestamp: number }> {
  try {
    const provider = getProvider();
    if (!provider) throw new Error('Provider not available');
    
    const feed = new ethers.Contract(feedAddress, CHAINLINK_PRICE_FEED_ABI, provider);
    const roundData = await feed.latestRoundData();
    
    const price = Number(roundData.price) / (10 ** decimals);
    const timestamp = Number(roundData.updatedAt);
    
    return { price, timestamp };
  } catch (error) {
    throw handleBlockchainError(error, 'getChainlinkPrice');
  }
}

/**
 * Get price from Uniswap pool
 */
async function getUniswapPrice(
  poolAddress: string,
  token0Decimals: number = 18,
  token1Decimals: number = 6
): Promise<{ price: number; timestamp: number }> {
  try {
    const provider = getProvider();
    if (!provider) throw new Error('Provider not available');
    
    const poolABI = [
      "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
    ];
    
    const pool = new ethers.Contract(poolAddress, poolABI, provider);
    const slot0 = await pool.slot0();
    
    const Q96 = 2n ** 96n;
    const sqrtPriceX96 = slot0.sqrtPriceX96;
    const price = Number(sqrtPriceX96) ** 2 / Number(Q96) ** 2;
    const adjustedPrice = price * (10 ** token0Decimals) / (10 ** token1Decimals);
    
    return {
      price: adjustedPrice,
      timestamp: Math.floor(Date.now() / 1000),
    };
  } catch (error) {
    throw handleBlockchainError(error, 'getUniswapPrice');
  }
}

/**
 * Get price from CoinGecko API
 */
async function getCoinGeckoPrice(tokenId: string = 'carecoin'): Promise<PriceData> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    );
    
    if (!response.ok) throw new Error('CoinGecko API error');
    
    const data = await response.json();
    const tokenData = data[tokenId];
    
    return {
      price: tokenData.usd,
      source: PriceSource.COINGECKO,
      timestamp: Date.now(),
      change24h: tokenData.usd_24h_change || 0,
      volume24h: tokenData.usd_24h_vol || 0,
      marketCap: tokenData.usd_market_cap || 0,
    };
  } catch (error) {
    throw new Error(`Failed to fetch CoinGecko price: ${error}`);
  }
}

/**
 * Get price from CoinMarketCap API
 */
async function getCoinMarketCapPrice(symbol: string = 'CARE'): Promise<PriceData> {
  try {
    const apiKey = import.meta.env.VITE_CMC_API_KEY;
    if (!apiKey) {
      throw new Error('CoinMarketCap API key not configured');
    }
    
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
        },
      }
    );
    
    if (!response.ok) throw new Error('CoinMarketCap API error');
    
    const data = await response.json();
    const quote = data.data[symbol][0].quote.USD;
    
    return {
      price: quote.price,
      source: PriceSource.COINMARKETCAP,
      timestamp: Date.now(),
      change24h: quote.percent_change_24h || 0,
      volume24h: quote.volume_24h || 0,
      marketCap: quote.market_cap || 0,
    };
  } catch (error) {
    throw new Error(`Failed to fetch CoinMarketCap price: ${error}`);
  }
}

/**
 * Get CareCoin price from multiple sources and return average
 */
export async function getCareCoinPrice(
  sources: PriceSource[] = [PriceSource.UNISWAP, PriceSource.COINGECKO]
): Promise<PriceData> {
  const prices: PriceData[] = [];
  
  for (const source of sources) {
    try {
      let priceData: PriceData;
      
      switch (source) {
        case PriceSource.CHAINLINK:
          // Would need Chainlink feed address for CARE/USD
          throw new Error('Chainlink feed not configured');
          
        case PriceSource.UNISWAP:
          // Would need Uniswap pool address
          const uniswapPrice = await getUniswapPrice(
            import.meta.env.VITE_UNISWAP_POOL_ADDRESS || '',
            18,
            6
          );
          priceData = {
            price: uniswapPrice.price,
            source: PriceSource.UNISWAP,
            timestamp: uniswapPrice.timestamp,
            change24h: 0, // Would need historical data
            volume24h: 0,
          };
          break;
          
        case PriceSource.COINGECKO:
          priceData = await getCoinGeckoPrice('carecoin');
          break;
          
        case PriceSource.COINMARKETCAP:
          priceData = await getCoinMarketCapPrice('CARE');
          break;
          
        default:
          continue;
      }
      
      prices.push(priceData);
    } catch (error) {
      console.warn(`Failed to get price from ${source}:`, error);
    }
  }
  
  if (prices.length === 0) {
    throw new Error('Failed to get price from any source');
  }
  
  // Calculate average price
  const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
  const avgChange24h = prices.reduce((sum, p) => sum + p.change24h, 0) / prices.length;
  const totalVolume24h = prices.reduce((sum, p) => sum + p.volume24h, 0);
  const totalMarketCap = prices.find(p => p.marketCap)?.marketCap || 0;
  
  return {
    price: avgPrice,
    source: prices[0].source, // Primary source
    timestamp: Date.now(),
    change24h: avgChange24h,
    volume24h: totalVolume24h,
    marketCap: totalMarketCap,
  };
}

/**
 * Get historical price data
 */
export interface HistoricalPrice {
  timestamp: number;
  price: number;
  volume: number;
}

export async function getHistoricalPrices(
  days: number = 30,
  source: PriceSource = PriceSource.COINGECKO
): Promise<HistoricalPrice[]> {
  try {
    if (source === PriceSource.COINGECKO) {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/carecoin/market_chart?vs_currency=usd&days=${days}`
      );
      
      if (!response.ok) throw new Error('CoinGecko API error');
      
      const data = await response.json();
      return data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
        volume: 0, // Would need separate API call
      }));
    }
    
    throw new Error(`Historical prices not supported for ${source}`);
  } catch (error) {
    throw new Error(`Failed to get historical prices: ${error}`);
  }
}

/**
 * Price change calculator
 */
export function calculatePriceChange(
  currentPrice: number,
  previousPrice: number
): { change: number; changePercent: number } {
  const change = currentPrice - previousPrice;
  const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
  
  return { change, changePercent };
}

/**
 * Real-time price subscription
 */
export class PriceSubscription {
  private intervalId: NodeJS.Timeout | null = null;
  private callbacks: Set<(price: PriceData) => void> = new Set();
  
  constructor(
    private sources: PriceSource[] = [PriceSource.UNISWAP, PriceSource.COINGECKO],
    private interval: number = 60000 // 1 minute
  ) {}
  
  subscribe(callback: (price: PriceData) => void): () => void {
    this.callbacks.add(callback);
    
    if (!this.intervalId) {
      this.start();
    }
    
    return () => {
      this.callbacks.delete(callback);
      if (this.callbacks.size === 0) {
        this.stop();
      }
    };
  }
  
  private async start() {
    const update = async () => {
      try {
        const price = await getCareCoinPrice(this.sources);
        this.callbacks.forEach(callback => callback(price));
      } catch (error) {
        console.error('Price update error:', error);
      }
    };
    
    // Initial update
    await update();
    
    // Periodic updates
    this.intervalId = setInterval(update, this.interval);
  }
  
  private stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

