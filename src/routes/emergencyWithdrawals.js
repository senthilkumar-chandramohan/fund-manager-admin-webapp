import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const router = express.Router();
const prisma = new PrismaClient();

// Configuration
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';
const SYSTEM_WALLET_PRIVATE_KEY = process.env.SYSTEM_WALLET_PRIVATE_KEY;

// Pension Fund Contract ABI for emergency withdrawals
const FUND_CONTRACT_ABI = [
  'function initiateEmergencyWithdrawal(uint256 _amount) returns (bytes32 withdrawalId)',
  'function approveEmergencyWithdrawal(address _governor, bytes32 withdrawalId)',
  'function executeEmergencyWithdrawal(bytes32 withdrawalId)',
  'function emergencyWithdrawals(bytes32) view returns (uint256 amount, address initiator, uint8 approvalCount, bool executed, uint256 timestamp)',
  'function GOVERNOR_THRESHOLD() view returns (uint8)'
];

// POST /api/admin/emergency-withdrawals - Create new emergency withdrawal request
router.post('/emergency-withdrawals', async (req, res) => {
  try {
    const { fundId, amount, reason } = req.body;

    if (!fundId || !amount) {
      return res.status(400).json({ message: 'Fund ID and Amount are required' });
    }

    // Fetch fund details
    const fund = await prisma.pensionFund.findUnique({
      where: { id: fundId },
      select: {
        id: true,
        name: true,
        contractAddress: true,
        stablecoin: true,
        selectedGovernors: true
      }
    });

    if (!fund) {
      return res.status(404).json({ message: 'Pension fund not found' });
    }

    // Execute blockchain transaction - initiateEmergencyWithdrawal
    let withdrawalId = null;
    try {
      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
      const systemWallet = new ethers.Wallet(SYSTEM_WALLET_PRIVATE_KEY, provider);
      const fundContract = new ethers.Contract(fund.contractAddress, FUND_CONTRACT_ABI, systemWallet);

      // Parse amount based on stablecoin decimals (assuming 6 for USDC/USDT/PYUSD)
      const amountInWei = ethers.parseUnits(amount, 6);

      console.log(`Initiating emergency withdrawal: Fund=${fund.contractAddress}, Amount=${amountInWei}`);

      // Execute the transaction
      const tx = await fundContract.initiateEmergencyWithdrawal(amountInWei);
      const receipt = await tx.wait();

      // Get the block to retrieve timestamp
      const block = await provider.getBlock(receipt.blockNumber);
      
      // Reconstruct withdrawalId using the same logic as the contract:
      // keccak256(abi.encodePacked("EMERGENCY_WITHDRAWAL", block.timestamp, msg.sender))
      withdrawalId = ethers.keccak256(
        ethers.solidityPacked(
          ['string', 'uint256', 'address'],
          ['EMERGENCY_WITHDRAWAL', block.timestamp, systemWallet.address]
        )
      );

      console.log(`✓ Emergency withdrawal initiated. TX: ${tx.hash}, Withdrawal ID: ${withdrawalId}`);
    } catch (blockchainError) {
      console.error('Blockchain error:', blockchainError);
      return res.status(500).json({ 
        message: 'Failed to initiate emergency withdrawal on blockchain',
        error: blockchainError.message 
      });
    }

    // Create database record
    const request = await prisma.emergencyWithdrawalRequest.create({
      data: {
        fundId,
        userId: 'Admin',
        withdrawalId,
        amount,
        reason: reason || '',
        status: 'Pending',
        approvedBy: []
      }
    });

    res.status(201).json({ 
      message: 'Emergency withdrawal request created successfully. Awaiting governor approvals.',
      request 
    });
  } catch (error) {
    console.error('Error creating emergency withdrawal:', error);
    res.status(500).json({ message: 'Failed to create emergency withdrawal request', error: error.message });
  }
});

// GET /api/admin/emergency-withdrawals - Get emergency withdrawal requests
router.get('/emergency-withdrawals', async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) {
      // If specific status requested, use it; otherwise default to Pending and PartiallyApproved
      where.status = status;
    } else {
      // Default: fetch both Pending and PartiallyApproved requests
      where.status = { in: ['Pending', 'PartiallyApproved'] };
    }

    const requests = await prisma.emergencyWithdrawalRequest.findMany({
      where,
      include: {
        fund: {
          select: {
            id: true,
            name: true,
            stablecoin: true,
            selectedGovernors: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // For each request, fetch available governors (those who haven't approved yet)
    const requestsWithGovernors = await Promise.all(
      requests.map(async (request) => {
        const approvedGovernorIds = request.approvedBy || [];
        const fundGovernorIds = request.fund.selectedGovernors || [];
        
        // Get governors who haven't approved yet
        const availableGovernorIds = fundGovernorIds.filter(
          govId => !approvedGovernorIds.includes(govId)
        );

        // Fetch governor details
        const availableGovernors = await prisma.user.findMany({
          where: {
            id: { in: availableGovernorIds },
            role: 'governor'
          },
          select: {
            id: true,
            name: true,
            email: true,
            wallet: true
          }
        });

        return {
          ...request,
          availableGovernors
        };
      })
    );

    res.json(requestsWithGovernors);
  } catch (error) {
    console.error('Error fetching emergency withdrawals:', error);
    res.status(500).json({ message: 'Failed to fetch emergency withdrawals', error: error.message });
  }
});

// POST /api/admin/emergency-withdrawals/:id/approve - Approve emergency withdrawal
router.post('/emergency-withdrawals/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { governorId } = req.body;

    if (!governorId) {
      return res.status(400).json({ message: 'Governor ID is required' });
    }

    // Fetch the request
    const request = await prisma.emergencyWithdrawalRequest.findUnique({
      where: { id },
      include: {
        fund: {
          select: {
            id: true,
            name: true,
            contractAddress: true,
            selectedGovernors: true
          }
        }
      }
    });

    if (!request) {
      return res.status(404).json({ message: 'Emergency withdrawal request not found' });
    }

    if (request.status !== 'Pending' && request.status !== 'PartiallyApproved') {
      return res.status(400).json({ message: 'Request is not in Pending or PartiallyApproved status' });
    }

    // Verify governor is assigned to the fund
    if (!request.fund.selectedGovernors.includes(governorId)) {
      return res.status(400).json({ message: 'Governor is not assigned to this fund' });
    }

    // Verify governor hasn't already approved
    if (request.approvedBy.includes(governorId)) {
      return res.status(400).json({ message: 'Governor has already approved this request' });
    }

    // Fetch governor details
    const governor = await prisma.user.findUnique({
      where: { id: governorId },
      select: { wallet: true, role: true }
    });

    if (!governor || governor.role !== 'governor') {
      return res.status(400).json({ message: 'Invalid governor' });
    }

    // Execute blockchain transaction - approveEmergencyWithdrawal
    try {
      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
      const systemWallet = new ethers.Wallet(SYSTEM_WALLET_PRIVATE_KEY, provider);
      const fundContract = new ethers.Contract(request.fund.contractAddress, FUND_CONTRACT_ABI, systemWallet);

      console.log(`Approving emergency withdrawal: Governor=${governor.wallet}, WithdrawalId=${request.withdrawalId}`);

      const tx = await fundContract.approveEmergencyWithdrawal(governor.wallet, request.withdrawalId);
      await tx.wait();

      console.log(`✓ Governor approval recorded. TX: ${tx.hash}`);
    } catch (blockchainError) {
      console.error('Blockchain error:', blockchainError);
      return res.status(500).json({ 
        message: 'Failed to approve on blockchain',
        error: blockchainError.message 
      });
    }

    // Update approvedBy array
    const updatedApprovedBy = [...request.approvedBy, governorId];

    // Check if all governors have approved
    const allApproved = request.fund.selectedGovernors.every(
      govId => updatedApprovedBy.includes(govId)
    );

    // Determine status: Pending -> PartiallyApproved (first approval) -> Processed (all approved)
    let updatedStatus = updatedApprovedBy.length === request.fund.selectedGovernors.length ? 'Processed' : 'PartiallyApproved';
    
    // If all governors approved, execute the withdrawal
    if (allApproved) {
      try {
        console.log(`All governors approved - executing withdrawal`);
        const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
        const systemWallet = new ethers.Wallet(SYSTEM_WALLET_PRIVATE_KEY, provider);
        const fundContract = new ethers.Contract(request.fund.contractAddress, FUND_CONTRACT_ABI, systemWallet);

        console.log(`Fund Contract address ${request.fund.contractAddress}`);
        const executeTx = await fundContract.executeEmergencyWithdrawal(request.withdrawalId);
        await executeTx.wait();

        console.log(`✓ Emergency withdrawal executed. TX: ${executeTx.hash}`);
        updatedStatus = 'Processed';
      } catch (executeError) {
        console.error('Execute error:', executeError);
        return res.status(500).json({ 
          message: 'Approval recorded but execution failed',
          error: executeError.message 
        });
      }
    }

    // Update database
    const updatedRequest = await prisma.emergencyWithdrawalRequest.update({
      where: { id },
      data: {
        approvedBy: updatedApprovedBy,
        status: updatedStatus
      }
    });

    res.json({ 
      message: allApproved 
        ? 'Withdrawal approved and executed successfully' 
        : 'Withdrawal approved. Awaiting additional approvals.',
      request: updatedRequest 
    });
  } catch (error) {
    console.error('Error approving emergency withdrawal:', error);
    res.status(500).json({ message: 'Failed to approve emergency withdrawal', error: error.message });
  }
});

// POST /api/admin/emergency-withdrawals/:id/reject - Reject emergency withdrawal
router.post('/emergency-withdrawals/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.emergencyWithdrawalRequest.findUnique({
      where: { id }
    });

    if (!request) {
      return res.status(404).json({ message: 'Emergency withdrawal request not found' });
    }

    if (request.status !== 'Pending' && request.status !== 'PartiallyApproved') {
      return res.status(400).json({ message: 'Request is not in Pending or PartiallyApproved status' });
    }

    const updatedRequest = await prisma.emergencyWithdrawalRequest.update({
      where: { id },
      data: { status: 'Rejected' }
    });

    res.json({ 
      message: 'Emergency withdrawal request rejected',
      request: updatedRequest 
    });
  } catch (error) {
    console.error('Error rejecting emergency withdrawal:', error);
    res.status(500).json({ message: 'Failed to reject emergency withdrawal', error: error.message });
  }
});

export default router;
