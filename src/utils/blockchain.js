import { ethers } from 'ethers';

// ERC20 ABI for balance checking
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

// Fund contract ABI
const FUND_CONTRACT_ABI = [
  'function token() view returns (address)',
  'function paused() view returns (bool)',
  'function owner() view returns (address)'
];

// Configuration
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';

/**
 * Get the balance of a fund contract in its stablecoin
 * @param {string} contractAddress - The fund contract address
 * @returns {Promise<{balance: string, balanceFormatted: string, tokenAddress: string}>}
 */
export async function getFundBalance(contractAddress) {
  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    
    // Create fund contract instance
    const fundContract = new ethers.Contract(contractAddress, FUND_CONTRACT_ABI, provider);
    
    // Get the token address from the fund contract
    const tokenAddress = await fundContract.token();
    
    // Create token contract instance
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    // Get balance and decimals
    const [balance, decimals] = await Promise.all([
      tokenContract.balanceOf(contractAddress),
      tokenContract.decimals()
    ]);
    
    // Format the balance
    const balanceFormatted = ethers.formatUnits(balance, decimals);
    
    return {
      balance: balance.toString(),
      balanceFormatted: parseFloat(balanceFormatted).toFixed(2),
      tokenAddress: tokenAddress
    };
  } catch (error) {
    console.error('Error fetching fund balance:', error);
    throw new Error(`Failed to fetch fund balance: ${error.message}`);
  }
}

/**
 * Get balances for multiple funds
 * @param {Array<{id: string, contractAddress: string}>} funds - Array of fund objects
 * @returns {Promise<Map<string, {balance: string, balanceFormatted: string}>>}
 */
export async function getMultipleFundBalances(funds) {
  const balanceMap = new Map();
  
  const balancePromises = funds.map(async (fund) => {
    if (!fund.contractAddress) {
      return { fundId: fund.id, balance: null };
    }
    
    try {
      const balanceData = await getFundBalance(fund.contractAddress);
      return { fundId: fund.id, balance: balanceData };
    } catch (error) {
      console.error(`Error fetching balance for fund ${fund.id}:`, error);
      return { fundId: fund.id, balance: null };
    }
  });
  
  const results = await Promise.all(balancePromises);
  
  results.forEach(({ fundId, balance }) => {
    balanceMap.set(fundId, balance);
  });
  
  return balanceMap;
}
