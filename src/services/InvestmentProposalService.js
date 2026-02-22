import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

// Fund contract ABI for investment function
const FUND_CONTRACT_ABI = [
  'function investFund(address investmentContractAddress, uint256 amount)',
  'function paused() view returns (bool)',
  'function owner() view returns (address)',
  'function token() view returns (address)',
  'error InvalidInvestmentContract()',
  'error ZeroAmount()',
  'error InsufficientTokens()',
  'error InvestmentFailed()'
];

// Investment contract ABI for checking existing investments
const INVESTMENT_CONTRACT_ABI = [
  'function investments(address investor) view returns (uint256)',
  'function stablecoinAddress() view returns (address)'
];

// ERC20 ABI for balance checking
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

// Configuration
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';
const SYSTEM_WALLET_PRIVATE_KEY = process.env.SYSTEM_WALLET_PRIVATE_KEY;

// Stablecoin addresses on Sepolia
const STABLECOIN_ADDRESSES = {
  'PYUSD': '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9',
  'USDC': '0xf08a50178dfcde18524640ea6618a1f965821715',
  'USDT': '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0'
};

export class InvestmentProposalService {
  // Admin: Get all investment proposals with optional filters
  static async getAllProposals(filters = {}) {
    try {
      const where = {};
      if (filters.status) where.status = filters.status;
      if (filters.fundId) where.fundId = filters.fundId;
      if (filters.riskLevel) where.riskLevel = filters.riskLevel;

      const proposals = await prisma.investmentProposal.findMany({
        where,
        include: {
          fund: { select: { id: true, name: true, description: true, riskAppetite: true, stablecoin: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return proposals;
    } catch (error) {
      throw new Error(`Failed to fetch proposals: ${error.message}`);
    }
  }

  // Admin: Get all pending investment proposals
  static async getPendingProposals(filters = {}) {
    try {
      return await InvestmentProposalService.getAllProposals({ ...filters, status: 'Pending' });
    } catch (error) {
      throw new Error(`Failed to fetch pending proposals: ${error.message}`);
    }
  }

  // Admin: Get single investment proposal by ID
  static async getProposalById(proposalId) {
    try {
      const proposal = await prisma.investmentProposal.findUnique({
        where: { id: proposalId },
        include: {
          fund: {
            select: {
              id: true,
              name: true,
              description: true,
              riskAppetite: true,
              stablecoin: true,
              contractAddress: true,
              maturity: true,
              reserveAmount: true,
              investmentDuration: true
            }
          },
        },
      });
      return proposal;
    } catch (error) {
      throw new Error(`Failed to fetch proposal: ${error.message}`);
    }
  }

  // Admin: Get all investment proposals for a fund
  static async getProposalsByFund(fundId) {
    try {
      const proposals = await prisma.investmentProposal.findMany({
        where: { fundId },
        orderBy: { createdAt: 'desc' },
      });
      return proposals;
    } catch (error) {
      throw new Error(`Failed to fetch fund proposals: ${error.message}`);
    }
  }

  // Admin: Create investment proposal
  static async createProposal(data) {
    try {
      const proposal = await prisma.investmentProposal.create({
        data: {
          fundId: data.fundId,
          aiScore: data.aiScore,
          expectedROI: data.expectedROI,
          riskLevel: data.riskLevel,
          investmentAmount: data.investmentAmount,
          investmentContract: data.investmentContract,
          status: 'Pending',
        },
      });
      return proposal;
    } catch (error) {
      throw new Error(`Failed to create proposal: ${error.message}`);
    }
  }

  // Admin: Approve investment proposal
  static async approveProposal(proposalId, approvedBy) {
    try {
      // First, fetch the proposal with fund details
      const proposal = await prisma.investmentProposal.findUnique({
        where: { id: proposalId },
        include: { 
          fund: { 
            select: { 
              id: true, 
              name: true, 
              stablecoin: true, 
              contractAddress: true
            } 
          } 
        }
      });

      if (!proposal) {
        throw new Error('Proposal not found');
      }

      if (proposal.status !== 'Pending') {
        throw new Error('Only pending proposals can be approved');
      }

      // Validate required fields for blockchain transfer
      if (!proposal.investmentAmount || !proposal.investmentContract) {
        throw new Error('Investment amount and contract address are required for approval');
      }

      if (!SYSTEM_WALLET_PRIVATE_KEY) {
        throw new Error('System wallet private key not configured. Cannot execute blockchain transfer.');
      }

      // Execute blockchain transfer
      let txHash = null;
      try {
        console.log(`Executing blockchain transfer for proposal ${proposalId}...`);
        txHash = await this.executeInvestmentTransfer(
          proposal.fund.contractAddress,
          proposal.fund.stablecoin,
          proposal.investmentContract,
          proposal.investmentAmount
        );
        console.log(`✓ Transfer successful. Transaction hash: ${txHash}`);
      } catch (transferError) {
        console.error('Blockchain transfer failed:', transferError.message);
        throw new Error(`Failed to execute blockchain transfer: ${transferError.message}`);
      }

      // Create transaction record
      await prisma.transaction.create({
        data: {
          fundId: proposal.fundId,
          txHash: txHash,
          type: 'Investment',
          amount: proposal.investmentAmount,
          status: 'Completed'
        }
      });

      // Update proposal status
      const updatedProposal = await prisma.investmentProposal.update({
        where: { id: proposalId },
        data: {
          status: 'Approved',
          approvedAt: new Date(),
          approvedBy,
        },
        include: { fund: true },
      });

      console.log(`✓ Proposal ${proposalId} approved and investment executed`);
      return updatedProposal;
    } catch (error) {
      throw new Error(`Failed to approve proposal: ${error.message}`);
    }
  }

  // Execute blockchain transfer by calling fund contract's investFund function
  static async executeInvestmentTransfer(fundContractAddress, stablecoin, investmentContract, amount) {
    try {
      // Setup provider and admin wallet
      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
      const systemWallet = new ethers.Wallet(SYSTEM_WALLET_PRIVATE_KEY, provider);

      console.log(`  System wallet address: ${systemWallet.address}`);
      console.log(`  Fund contract: ${fundContractAddress}`);
      console.log(`  Investment contract: ${investmentContract}`);
      console.log(`  Amount: ${amount} ${stablecoin}`);

      // Create fund contract instance
      const fundContract = new ethers.Contract(fundContractAddress, FUND_CONTRACT_ABI, systemWallet);

      // Check if contract is paused
      try {
        const isPaused = await fundContract.paused();
        console.log(`  Fund contract paused: ${isPaused}`);
        if (isPaused) {
          throw new Error('Fund contract is paused. Cannot execute investment.');
        }
      } catch (pausedError) {
        console.warn(`  Warning: Could not check paused status - ${pausedError.message}`);
      }

      // Check ownership
      try {
        const owner = await fundContract.owner();
        console.log(`  Fund contract owner: ${owner}`);
        console.log(`  System wallet matches owner: ${owner.toLowerCase() === systemWallet.address.toLowerCase()}`);
        if (owner.toLowerCase() !== systemWallet.address.toLowerCase()) {
          throw new Error(`System wallet ${systemWallet.address} is not the owner of the fund contract. Owner is ${owner}`);
        }
      } catch (ownerError) {
        console.warn(`  Warning: Could not verify ownership - ${ownerError.message}`);
      }

      // Get stablecoin contract address
      const tokenAddress = STABLECOIN_ADDRESSES[stablecoin];
      if (!tokenAddress) {
        throw new Error(`Unknown stablecoin: ${stablecoin}`);
      }

      // Check token address
      try {
        const fundTokenAddress = await fundContract.token();
        console.log(`  Fund contract token address: ${fundTokenAddress}`);
        console.log(`  Expected token address for ${stablecoin}: ${tokenAddress}`);
        if (fundTokenAddress.toLowerCase() !== tokenAddress.toLowerCase()) {
          throw new Error(`Fund contract token mismatch! Fund is configured for token at ${fundTokenAddress}, but trying to invest ${stablecoin} at ${tokenAddress}. The fund contract must be configured for the correct stablecoin.`);
        }
      } catch (tokenError) {
        if (tokenError.message.includes('mismatch')) {
          throw tokenError;
        }
        console.warn(`  Warning: Could not verify token address - ${tokenError.message}`);
      }

      // Check fund balance
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const fundBalance = await tokenContract.balanceOf(fundContractAddress);
      const decimals = await tokenContract.decimals();
      
      console.log(`  Fund ${stablecoin} balance: ${ethers.formatUnits(fundBalance, decimals)}`);

      // Check current allowance from fund to investment contract
      const currentAllowance = await tokenContract.allowance(fundContractAddress, investmentContract);
      console.log(`  Current allowance from fund to investment contract: ${ethers.formatUnits(currentAllowance, decimals)} ${stablecoin}`);

      // Parse amount
      const amountInWei = ethers.parseUnits(amount, decimals);
      
      if (fundBalance < amountInWei) {
        throw new Error(`Insufficient fund balance. Required: ${amount} ${stablecoin}, Available: ${ethers.formatUnits(fundBalance, decimals)} ${stablecoin}`);
      }

      // Check if fund already has an existing investment in this contract
      try {
        const investContract = new ethers.Contract(investmentContract, INVESTMENT_CONTRACT_ABI, provider);
        const existingInvestment = await investContract.investments(fundContractAddress);
        console.log(`  Existing investment in this contract: ${ethers.formatUnits(existingInvestment, decimals)} ${stablecoin}`);
        
        if (existingInvestment > 0n) {
          throw new Error(`Fund already has an active investment of ${ethers.formatUnits(existingInvestment, decimals)} ${stablecoin} in this investment contract. The investment contract requires withdrawing the existing investment before making a new one.`);
        }

        // Verify investment contract uses the same stablecoin
        const investContractStablecoin = await investContract.stablecoinAddress();
        console.log(`  Investment contract stablecoin: ${investContractStablecoin}`);
        if (investContractStablecoin.toLowerCase() !== tokenAddress.toLowerCase()) {
          throw new Error(`Investment contract stablecoin mismatch! Investment contract uses ${investContractStablecoin}, but fund uses ${tokenAddress}`);
        }
      } catch (checkError) {
        if (checkError.message.includes('already has an active investment') || checkError.message.includes('stablecoin mismatch')) {
          throw checkError;
        }
        console.warn(`  Warning: Could not check existing investment - ${checkError.message}`);
      }

      console.log(`  Calling investFund(${investmentContract}, ${amountInWei.toString()})...`);

      // Additional diagnostic: Check if investment contract bytecode exists
      try {
        const investmentContractCode = await provider.getCode(investmentContract);
        console.log(`  Investment contract bytecode length: ${investmentContractCode.length} bytes`);
        if (investmentContractCode === '0x' || investmentContractCode.length <= 2) {
          throw new Error(`No contract deployed at investment contract address ${investmentContract}`);
        }
      } catch (codeError) {
        if (codeError.message.includes('No contract deployed')) {
          throw codeError;
        }
        console.warn(`  Warning: Could not verify investment contract bytecode - ${codeError.message}`);
      }

      // Try staticCall first to get the actual revert reason
      try {
        await fundContract.investFund.staticCall(investmentContract, amountInWei);
        console.log(`  Static call successful - transaction should succeed`);
      } catch (staticError) {
        console.error(`  Static call failed:`, staticError);
        
        // Try to decode custom errors
        let revertReason = 'Unknown reason';
        
        if (staticError.data) {
          const errorData = staticError.data;
          
          // Check for known error signatures
          if (errorData.includes('0x3f6cc768')) {
            revertReason = 'InvalidInvestmentContract - Investment contract address is invalid or zero';
          } else if (errorData.includes('0x9896d02b')) {
            revertReason = 'ZeroAmount - Investment amount cannot be zero';
          } else if (errorData.includes('0x1ba90f45')) {
            revertReason = 'InsufficientTokens - Fund does not have enough tokens';
          } else if (errorData.includes('0x5da5f3d7')) {
            revertReason = 'InvestmentFailed - The investment contract rejected the investment. This likely means the investment contract\'s invest() function reverted. Check if the investment contract is valid and accepts investments.';
          } else {
            try {
              revertReason = ethers.toUtf8String('0x' + errorData.slice(138));
            } catch (e) {
              revertReason = errorData;
            }
          }
        } else if (staticError.reason) {
          revertReason = staticError.reason;
        } else if (staticError.message) {
          revertReason = staticError.message;
        }
        
        throw new Error(`Contract will revert: ${revertReason}`);
      }

      // Execute transaction
      const tx = await fundContract.investFund(investmentContract, amountInWei);
      console.log(`  Transaction submitted: ${tx.hash}`);
      console.log(`  Waiting for confirmation...`);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log(`  Transaction confirmed in block ${receipt.blockNumber}`);

      return tx.hash;
    } catch (error) {
      console.error('Investment execution error:', error);
      throw error;
    }
  }

  // Admin: Reject investment proposal
  static async rejectProposal(proposalId, approvedBy) {
    try {
      const proposal = await prisma.investmentProposal.update({
        where: { id: proposalId },
        data: {
          status: 'Rejected',
          rejectedAt: new Date(),
          approvedBy,
        },
        include: { fund: true },
      });
      return proposal;
    } catch (error) {
      throw new Error(`Failed to reject proposal: ${error.message}`);
    }
  }
}

export default InvestmentProposalService;
