import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PensionFundService {
  // Admin: Create new pension fund (with smart contract)
  static async createPensionFund(data) {
    try {
      const fund = await prisma.pensionFund.create({
        data: {
          name: data.name,
          description: data.description,
          corpus: data.corpus,
          maturity: new Date(data.maturity),
          stablecoin: data.stablecoin,
          riskAppetite: data.riskAppetite || 'MEDIUM',
          contractAddress: data.contractAddress,
          contractDeployed: data.contractDeployed || false,
          roi: data.roi || '0',
          creatorId: data.creatorId,
        },
      });
      return fund;
    } catch (error) {
      throw new Error(`Failed to create pension fund: ${error.message}`);
    }
  }

  // Admin: Get all pension funds
  static async getAllPensionFunds(filters = {}) {
    try {
      const where = {};
      if (filters.status) where.status = filters.status;
      if (filters.stablecoin) where.stablecoin = filters.stablecoin;

      const funds = await prisma.pensionFund.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, email: true } },
          investmentProposals: true,
          workflows: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return funds;
    } catch (error) {
      throw new Error(`Failed to fetch pension funds: ${error.message}`);
    }
  }

  // User: Get pension funds by user (as creator, contributor, beneficiary, or governor)
  static async getUserPensionFunds(userId) {
    try {
      const funds = await prisma.pensionFund.findMany({
        where: {
          creatorId: userId,
        },
        include: {
          investmentProposals: true,
          workflows: true,
          transactions: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return funds;
    } catch (error) {
      throw new Error(`Failed to fetch user pension funds: ${error.message}`);
    }
  }

  // User: Get detailed pension fund information
  static async getPensionFundDetails(fundId) {
    try {
      const fund = await prisma.pensionFund.findUnique({
        where: { id: fundId },
        include: {
          creator: { select: { id: true, name: true, email: true, wallet: true } },
          investmentProposals: { orderBy: { createdAt: 'desc' } },
          workflows: { orderBy: { lastRun: 'desc' } },
          transactions: { orderBy: { createdAt: 'desc' }, take: 10 },
        },
      });
      return fund;
    } catch (error) {
      throw new Error(`Failed to fetch pension fund details: ${error.message}`);
    }
  }

  // Update risk appetite for a pension fund
  static async updateRiskAppetite(fundId, riskAppetite) {
    try {
      const fund = await prisma.pensionFund.update({
        where: { id: fundId },
        data: { riskAppetite },
      });
      return fund;
    } catch (error) {
      throw new Error(`Failed to update risk appetite: ${error.message}`);
    }
  }
}

export default PensionFundService;
