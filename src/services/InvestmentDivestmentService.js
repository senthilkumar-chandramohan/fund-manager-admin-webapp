import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

// Fund contract ABI for withdraw function
const FUND_CONTRACT_ABI = [
//  'function withdrawInvestment(address _investmentContract) returns (uint256 withdrawnAmount)',
  'function withdrawInvestment(address investmentContractAddress)',
  'function paused() view returns (bool)',
  'function owner() view returns (address)',
  'function token() view returns (address)'
];

// Configuration
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';
const SYSTEM_WALLET_PRIVATE_KEY = process.env.SYSTEM_WALLET_PRIVATE_KEY;

/**
 * Investment Divestment Service
 * Runs daily to identify matured investments and divest them
 */
class InvestmentDivestmentService {
  constructor() {
    if (!SYSTEM_WALLET_PRIVATE_KEY) {
      console.warn('⚠ SYSTEM_WALLET_PRIVATE_KEY not configured. Divestment operations will fail.');
    }
  }

  /**
   * Main execution function for the divestment job
   */
  async execute() {
    console.log('========================================');
    console.log(`Investment Divestment Job Started at ${new Date().toISOString()}`);
    console.log('========================================');

    try {
      // Fetch all matured investments that are still invested
      const maturedInvestments = await this.fetchMaturedInvestments();
      console.log(`Found ${maturedInvestments.length} matured investment(s) to divest`);

      let processedCount = 0;
      let successCount = 0;
      let failedCount = 0;

      // Process each matured investment
      for (const investment of maturedInvestments) {
        try {
          console.log(`\nProcessing Investment: ${investment.id}`);
          console.log(`  Fund: ${investment.fund.name}`);
          console.log(`  Amount: ${investment.investmentAmount}`);
          console.log(`  Maturity Date: ${investment.maturityDate.toISOString()}`);
          
          const result = await this.divestInvestment(investment);
          processedCount++;
          
          if (result.success) {
            successCount++;
            console.log(`✓ Successfully divested investment ${investment.id}`);
            console.log(`  Transaction Hash: ${result.txHash}`);
          } else {
            failedCount++;
            console.log(`✗ Failed to divest investment ${investment.id}: ${result.error}`);
          }
        } catch (error) {
          processedCount++;
          failedCount++;
          console.error(`✗ Error processing investment ${investment.id}:`, error.message);
        }
      }

      console.log('\n========================================');
      console.log(`Investment Divestment Job Completed`);
      console.log(`Processed: ${processedCount}/${maturedInvestments.length} investments`);
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
      console.error('Investment Divestment Job Failed:', error);
      throw error;
    }
  }

  /**
   * Fetch all matured investments from database
   */
  async fetchMaturedInvestments() {
    const currentDate = new Date();
    
    return await prisma.investment.findMany({
      where: {
        status: 'INVESTED',
        maturityDate: {
          lte: currentDate
        }
      },
      include: {
        fund: {
          select: {
            id: true,
            name: true,
            contractAddress: true
          }
        }
      }
    });
  }

  /**
   * Divest a single investment by calling the fund contract's withdrawFund function
   */
  async divestInvestment(investment) {
    try {
      // Validate required fields
      if (!investment.fund.contractAddress) {
        return {
          success: false,
          error: 'Fund contract address not found'
        };
      }

      if (!investment.investmentContract) {
        return {
          success: false,
          error: 'Investment contract address not found'
        };
      }

      if (!SYSTEM_WALLET_PRIVATE_KEY) {
        return {
          success: false,
          error: 'System wallet private key not configured'
        };
      }

      // Setup provider and wallet
      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
      const wallet = new ethers.Wallet(SYSTEM_WALLET_PRIVATE_KEY, provider);

      // Create fund contract instance
      const fundContract = new ethers.Contract(
        investment.fund.contractAddress,
        FUND_CONTRACT_ABI,
        wallet
      );

      // Parse investment amount (assuming it's stored in human-readable format)
      const amount = ethers.parseUnits(investment.investmentAmount, 6); // 6 decimals for stablecoins

      console.log(`  Calling withdrawInvestment on contract ${investment.fund.contractAddress}`);
      console.log(`  Investment Contract: ${investment.investmentContract}`);
      console.log(`  Amount: ${ethers.formatUnits(amount, 6)}`);

      // Call withdrawInvestment function
      const tx = await fundContract.withdrawInvestment(
        investment.investmentContract
      );

      console.log(`  Transaction sent: ${tx.hash}`);
      console.log(`  Waiting for confirmation...`);

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        // Update investment status in database
        await prisma.investment.update({
          where: { id: investment.id },
          data: {
            status: 'DIVESTED',
            updatedAt: new Date()
          }
        });

        // Create transaction record
        await prisma.transaction.create({
          data: {
            fundId: investment.fund.id,
            txHash: tx.hash,
            type: 'Divestment',
            amount: investment.investmentAmount,
            status: 'Completed'
          }
        });

        return {
          success: true,
          txHash: tx.hash
        };
      } else {
        return {
          success: false,
          error: 'Transaction failed',
          txHash: tx.hash
        };
      }
    } catch (error) {
      console.error(`  Error during divestment:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default InvestmentDivestmentService;
