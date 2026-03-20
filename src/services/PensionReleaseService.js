import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import axios from 'axios';

const prisma = new PrismaClient();

// Fund contract ABI for pension release
const FUND_CONTRACT_ABI = [
  'function releaseRegularPension(uint256 _inflationCoefficient) external',
  'function withdrawInvestment(address investmentContractAddress) external',
  'function token() view returns (address)',
  'function paused() view returns (bool)',
  'function owner() view returns (address)',
  'function releaseAmount() view returns (uint256)'
];

// ERC20 ABI for balance checking
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

// Configuration
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';
const SYSTEM_WALLET_PRIVATE_KEY = process.env.SYSTEM_WALLET_PRIVATE_KEY;
const INFLATION_API_URL = 'http://www.statbureau.org/calculate-inflation-price-jsonp';

/**
 * Pension Release Service
 * Handles automated pension release based on maturity and release intervals
 */
class PensionReleaseService {
  constructor() {
    if (!SYSTEM_WALLET_PRIVATE_KEY) {
      console.warn('⚠ SYSTEM_WALLET_PRIVATE_KEY not configured. Pension release operations will fail.');
    }
  }

  /**
   * Main execution function for the pension release job
   */
  async execute() {
    console.log('========================================');
    console.log(`Pension Release Job Started at ${new Date().toISOString()}`);
    console.log('========================================');

    try {
      // Fetch all pension funds that are due for release
      const dueForReleaseFunds = await this.fetchDueForReleaseFunds();
      console.log(`Found ${dueForReleaseFunds.length} pension fund(s) due for release`);

      let processedCount = 0;
      let successCount = 0;
      let failedCount = 0;

      // Process each fund
      for (const fund of dueForReleaseFunds) {
        try {
          console.log(`\nProcessing Fund: ${fund.name} (${fund.id})`);
          console.log(`  Contract Address: ${fund.contractAddress}`);
          console.log(`  Maturity: ${fund.maturity.toISOString()}`);
          console.log(`  Release Interval: ${fund.releaseInterval}`);
          console.log(`  Last Released: ${fund.lastReleasedDate ? fund.lastReleasedDate.toISOString() : 'Never'}`);
          
          const result = await this.processPensionRelease(fund);
          processedCount++;
          
          if (result.success) {
            successCount++;
            console.log(`✓ Successfully released pension for fund ${fund.id}`);
            console.log(`  Transaction Hash: ${result.txHash}`);
            if (result.investmentsLiquidated && result.investmentsLiquidated.length > 0) {
              console.log(`  Liquidated ${result.investmentsLiquidated.length} investment(s)`);
            }
          } else {
            failedCount++;
            console.log(`✗ Failed to release pension for fund ${fund.id}: ${result.error}`);
          }
        } catch (error) {
          processedCount++;
          failedCount++;
          console.error(`✗ Error processing fund ${fund.id}:`, error.message);
        }
      }

      console.log('\n========================================');
      console.log(`Pension Release Job Completed`);
      console.log(`Processed: ${processedCount}/${dueForReleaseFunds.length} funds`);
      console.log(`Successful: ${successCount}`);
      console.log(`Failed: ${failedCount}`);
      console.log('========================================\n');

      return {
        success: true,
        processed: processedCount,
        successful: successCount,
        failed: failedCount
      };
    } catch (error) {
      console.error('Pension Release Job Failed:', error);
      throw error;
    }
  }

  /**
   * Fetch all pension funds that are due for a release
   */
  async fetchDueForReleaseFunds() {
    const currentDate = new Date();
    
    // Get all funds that have matured
    const maturedFunds = await prisma.pensionFund.findMany({
      where: {
        maturity: {
          lte: currentDate
        },
        releaseInterval: {
          not: null
        }
      },
      include: {
        investments: {
          where: {
            status: 'INVESTED'
          },
          include: {
            proposal: true
          }
        }
      }
    });

    // Filter funds that are due for release based on their release interval
    const dueForReleaseFunds = maturedFunds.filter(fund => {
      return this.isDueForRelease(fund, currentDate);
    });

    return dueForReleaseFunds;
  }

  /**
   * Check if a fund is due for release based on release interval and last release date
   */
  isDueForRelease(fund, currentDate) {
    // If never released, and maturity has passed, it's due
    if (!fund.lastReleasedDate) {
      return true;
    }

    const lastReleaseDate = new Date(fund.lastReleasedDate);
    const daysSinceLastRelease = Math.floor((currentDate - lastReleaseDate) / (1000 * 60 * 60 * 24));

    switch (fund.releaseInterval) {
      case 'WEEKLY':
        return daysSinceLastRelease >= 7;
      case 'FORTNIGHTLY':
        return daysSinceLastRelease >= 14;
      case 'MONTHLY':
        return daysSinceLastRelease >= 30;
      case 'QUARTERLY':
        return daysSinceLastRelease >= 90;
      default:
        return false;
    }
  }

  /**
   * Process pension release for a specific fund
   */
  async processPensionRelease(fund) {
    try {
      // Get inflation coefficient
      const inflationCoefficient = await this.getInflationCoefficient(fund.createdAt);
      console.log(`  Inflation Coefficient: ${inflationCoefficient}`);

      // Check fund balance
      const fundBalance = await this.getFundBalance(fund.contractAddress);
      console.log(`  Fund Balance: ${fundBalance.balanceFormatted}`);

// Get release amount from contract
      const releaseAmount = await this.getReleaseAmount(fund.contractAddress, fundBalance.decimals);
      console.log(`  Release Amount: ${releaseAmount.amountFormatted}`);

      // Liquidate investments if necessary
      const investmentsLiquidated = await this.ensureSufficientFunds(fund, fundBalance, releaseAmount);

      // Execute blockchain transaction to release pension
      const txHash = await this.executePensionRelease(fund.contractAddress, inflationCoefficient);

      // Update last released date in database
      await prisma.pensionFund.update({
        where: { id: fund.id },
        data: { lastReleasedDate: new Date() }
      });

      return {
        success: true,
        txHash,
        inflationCoefficient,
        investmentsLiquidated
      };
    } catch (error) {
      console.error(`Error processing pension release for fund ${fund.id}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get inflation coefficient from external API
   */
  async getInflationCoefficient(fundCreatedDate) {
    try {
      const currentDate = new Date();
      const createdYear = fundCreatedDate.getFullYear();
      const currentYear = currentDate.getFullYear();

      // Build API URL - using JSONP callback parameter
      const apiUrl = `${INFLATION_API_URL}?country=united-states&start=${createdYear}%2F01%2F01&amount=100&end=${currentYear}%2F${String(currentDate.getMonth() + 1).padStart(2, '0')}%2F${String(currentDate.getDate()).padStart(2, '0')}&format=true&jsoncallback=processInflation`;

      console.log(`  Fetching inflation data from: ${apiUrl}`);

      const response = await axios.get(apiUrl);
      const jsonpText = response.data;

      // Parse JSONP response (format: processInflation(123.45))
      const match = jsonpText.match(/processInflation\(([\d.]+)\)/);
      
      if (!match || !match[1]) {
        console.warn('  ⚠ Failed to parse inflation data, using default coefficient of 100 (no inflation)');
        return '100'; // Default to 100 (100% = 1.0x multiplier, no change)
      }

      const inflationValue = parseFloat(match[1]);
      console.log(`  Raw Inflation Value: ${inflationValue}`);

      // Use the inflation value directly as percentage
      // e.g., 123.45 means 123.45% (multiply by 1.2345)
      // Round to integer for smart contract (123 means 123%)
      // Contract formula: finalAmount = releaseAmount * coefficient / 100
      const coefficient = Math.round(inflationValue);
      
      const multiplier = (coefficient / 100).toFixed(2);
      console.log(`  Inflation Coefficient: ${coefficient} (${multiplier}x multiplier)`);
      
      return coefficient.toString();
    } catch (error) {
      console.error('  Error fetching inflation coefficient:', error.message);
      console.warn('  Using default coefficient of 100 (no inflation, 1.0x multiplier)');
      return '100'; // Default to 100 (100% = 1.0x multiplier, no change)
    }
  }

  /**
   * Get release amount from fund contract
   */
  async getReleaseAmount(contractAddress, decimals) {
    try {
      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
      const fundContract = new ethers.Contract(contractAddress, FUND_CONTRACT_ABI, provider);
      
      const releaseAmount = await fundContract.releaseAmount();
      const amountFormatted = ethers.formatUnits(releaseAmount, decimals);
      
      return {
        amount: releaseAmount.toString(),
        amountFormatted: parseFloat(amountFormatted).toFixed(2),
        amountBigInt: releaseAmount
      };
    } catch (error) {
      console.error('  Error fetching release amount:', error);
      throw new Error(`Failed to fetch release amount: ${error.message}`);
    }
  }

  /**
   * Get fund balance from blockchain
   */
  async getFundBalance(contractAddress) {
    try {
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
        balanceBigInt: balance,
        decimals,
        tokenAddress
      };
    } catch (error) {
      console.error('  Error fetching fund balance:', error);
      throw new Error(`Failed to fetch fund balance: ${error.message}`);
    }
  }

  /**
   * Ensure sufficient funds by liquidating investments if necessary
   * Liquidates riskier investments first
   */
  async ensureSufficientFunds(fund, fundBalance, releaseAmount) {
    const liquidatedInvestments = [];

    // Compare fund balance with required release amount
    const balance = parseFloat(fundBalance.balanceFormatted);
    const required = parseFloat(releaseAmount.amountFormatted);
    
    if (balance < required) {
      const shortfall = (required - balance).toFixed(2);
      console.log(`  ⚠ Insufficient funds detected. Balance: ${balance}, Required: ${required}, Shortfall: ${shortfall}`);
      console.log('  Checking investments to liquidate...');

      // Get active investments with their risk levels (sorted by risk - highest first)
      const activeInvestments = fund.investments
        .filter(inv => inv.status === 'INVESTED')
        .sort((a, b) => {
          const riskOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          const riskA = a.proposal?.riskLevel || 'MEDIUM';
          const riskB = b.proposal?.riskLevel || 'MEDIUM';
          return riskOrder[riskB] - riskOrder[riskA];
        });

      if (activeInvestments.length === 0) {
        console.log('  No active investments available to liquidate');
        return liquidatedInvestments;
      }

      // Liquidate the riskiest investment(s)
      for (const investment of activeInvestments) {
        try {
          console.log(`  Liquidating investment: ${investment.id}`);
          console.log(`    Amount: ${investment.investmentAmount}`);
          console.log(`    Risk Level: ${investment.proposal?.riskLevel || 'UNKNOWN'}`);
          
          await this.liquidateInvestment(fund.contractAddress, investment);
          liquidatedInvestments.push(investment.id);
          
          // Update investment status in database
          await prisma.investment.update({
            where: { id: investment.id },
            data: { status: 'DIVESTED' }
          });

          console.log(`  ✓ Successfully liquidated investment ${investment.id}`);
          
          // For now, liquidate only one. This can be enhanced to check balance and liquidate more if needed
          break;
        } catch (error) {
          console.error(`  Error liquidating investment ${investment.id}:`, error.message);
        }
      }
    }

    return liquidatedInvestments;
  }

  /**
   * Liquidate a specific investment
   */
  async liquidateInvestment(fundContractAddress, investment) {
    if (!investment.investmentContract) {
      throw new Error('Investment contract address not found');
    }

    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(SYSTEM_WALLET_PRIVATE_KEY, provider);
    
    const fundContract = new ethers.Contract(fundContractAddress, FUND_CONTRACT_ABI, wallet);
    
    // Execute withdrawal
    const tx = await fundContract.withdrawInvestment(investment.investmentContract);
    await tx.wait();
    
    return tx.hash;
  }

  /**
   * Execute pension release on blockchain
   */
  async executePensionRelease(contractAddress, inflationCoefficient) {
    try {
      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
      const wallet = new ethers.Wallet(SYSTEM_WALLET_PRIVATE_KEY, provider);
      
      const fundContract = new ethers.Contract(contractAddress, FUND_CONTRACT_ABI, wallet);
      
      // Execute pension release
      console.log(`  Executing releaseRegularPension with coefficient: ${inflationCoefficient}`);
      const tx = await fundContract.releaseRegularPension(inflationCoefficient);
      
      console.log(`  Transaction submitted: ${tx.hash}`);
      console.log(`  Waiting for confirmation...`);
      
      const receipt = await tx.wait();
      console.log(`  Transaction confirmed in block: ${receipt.blockNumber}`);
      
      return tx.hash;
    } catch (error) {
      console.error('  Error executing pension release:', error);
      throw new Error(`Failed to execute pension release: ${error.message}`);
    }
  }
}

export default PensionReleaseService;
