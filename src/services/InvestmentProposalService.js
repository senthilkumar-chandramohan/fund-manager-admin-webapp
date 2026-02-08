import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class InvestmentProposalService {
  // Admin: Get all pending investment proposals
  static async getPendingProposals(filters = {}) {
    try {
      const where = { status: 'Pending' };
      if (filters.fundId) where.fundId = filters.fundId;
      if (filters.riskLevel) where.riskLevel = filters.riskLevel;

      const proposals = await prisma.investmentProposal.findMany({
        where,
        include: {
          fund: { select: { id: true, name: true, corpus: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return proposals;
    } catch (error) {
      throw new Error(`Failed to fetch pending proposals: ${error.message}`);
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
      const proposal = await prisma.investmentProposal.update({
        where: { id: proposalId },
        data: {
          status: 'Approved',
          approvedAt: new Date(),
          approvedBy,
        },
        include: { fund: true },
      });
      return proposal;
    } catch (error) {
      throw new Error(`Failed to approve proposal: ${error.message}`);
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
