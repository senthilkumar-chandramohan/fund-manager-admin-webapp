import { ethers } from 'ethers';

// ERC20 ABI for balance checking and approvals
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

// Fund contract ABI
const FUND_CONTRACT_ABI = [
  'function token() view returns (address)',
  'function paused() view returns (bool)',
  'function owner() view returns (address)',
  'function contributeFund(uint256 _amount, string memory note) external'
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

/**
 * Contribute funds to a pension fund contract
 * @param {string} tokenAddress - The ERC20 token contract address
 * @param {string} fundContractAddress - The pension fund contract address
 * @param {string} amount - The amount to contribute (in decimal format, e.g., "100.50")
 * @param {string} note - Optional note for the contribution
 * @returns {Promise<{approveTxHash: string, contributeTxHash: string, success: boolean, blockNumber: number}>}
 */
export async function contributeToPensionFund(tokenAddress, fundContractAddress, amount, note = 'Fund contribution') {
  try {
    // Get system wallet private key from environment
    const systemPrivateKey = process.env.SYSTEM_WALLET_PRIVATE_KEY;
    if (!systemPrivateKey) {
      throw new Error('System wallet private key not configured in environment');
    }

    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(systemPrivateKey, provider);

    console.log(`System wallet address: ${wallet.address}`);

    // Create token contract instance
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

    // Get decimals to format the amount properly
    const decimals = await tokenContract.decimals();
    const amountInWei = ethers.parseUnits(amount.toString(), decimals);

    console.log(`Contributing ${amount} tokens (${amountInWei.toString()} wei) to fund ${fundContractAddress}`);

    // Step 1: Approve the fund contract to spend tokens
    console.log('Step 1: Approving fund contract to spend tokens...');
    const approveTx = await tokenContract.approve(fundContractAddress, amountInWei);
    console.log(`Approval transaction submitted: ${approveTx.hash}`);
    
    const approveReceipt = await approveTx.wait();
    console.log(`Approval confirmed in block ${approveReceipt.blockNumber}`);

    // Step 2: Call contributeFund on the pension fund contract
    console.log('Step 2: Calling contributeFund on pension fund contract...');
    const fundContract = new ethers.Contract(fundContractAddress, FUND_CONTRACT_ABI, wallet);
    
    const contributeTx = await fundContract.contributeFund(amountInWei, note);
    console.log(`Contribution transaction submitted: ${contributeTx.hash}`);
    
    const contributeReceipt = await contributeTx.wait();
    console.log(`Contribution confirmed in block ${contributeReceipt.blockNumber}`);

    return {
      approveTxHash: approveReceipt.hash,
      contributeTxHash: contributeReceipt.hash,
      success: contributeReceipt.status === 1,
      blockNumber: contributeReceipt.blockNumber
    };
  } catch (error) {
    console.error('Error contributing to pension fund:', error);
    throw new Error(`Failed to contribute to pension fund: ${error.message}`);
  }
}
