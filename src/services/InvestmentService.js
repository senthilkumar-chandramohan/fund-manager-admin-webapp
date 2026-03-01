import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class InvestmentService {
  // Get all investments with optional filters
  static async getAllInvestments(filters = {}) {
    try {
      const where = {};
      
      if (filters.status) {
        where.status = filters.status;
      }
      
      if (filters.fundId) {
        where.fundId = filters.fundId;
      }

      const investments = await prisma.investment.findMany({
        where,
        include: {
          fund: {
            select: {
              id: true,
              name: true,
              stablecoin: true,
              contractAddress: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return investments;
    } catch (error) {
      throw new Error(`Failed to fetch investments: ${error.message}`);
    }
  }

  // Get investment by ID
  static async getInvestmentById(investmentId) {
    try {
      const investment = await prisma.investment.findUnique({
        where: { id: investmentId },
        include: {
          fund: {
            select: {
              id: true,
              name: true,
              description: true,
              stablecoin: true,
              contractAddress: true,
              riskAppetite: true,
              investmentDuration: true
            }
          },
          proposal: {
            select: {
              id: true,
              aiScore: true,
              riskLevel: true,
              status: true
            }
          }
        }
      });

      return investment;
    } catch (error) {
      throw new Error(`Failed to fetch investment: ${error.message}`);
    }
  }

  // Get investments by fund ID
  static async getInvestmentsByFund(fundId) {
    try {
      const investments = await prisma.investment.findMany({
        where: { fundId },
        orderBy: { createdAt: 'desc' }
      });

      return investments;
    } catch (error) {
      throw new Error(`Failed to fetch fund investments: ${error.message}`);
    }
  }
}

export default InvestmentService;
