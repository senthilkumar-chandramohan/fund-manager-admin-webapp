import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TerminationService {
  // Governor: Get pending termination requests
  static async getPendingTerminations() {
    try {
      const requests = await prisma.terminationRequest.findMany({
        where: { status: 'Pending' },
        include: {
          fund: { select: { id: true, name: true, creator: { select: { id: true, name: true, email: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return requests;
    } catch (error) {
      throw new Error(`Failed to fetch pending terminations: ${error.message}`);
    }
  }

  // Create termination request
  static async createTerminationRequest(fundId, reason) {
    try {
      const request = await prisma.terminationRequest.create({
        data: {
          fundId,
          reason,
          status: 'Pending',
        },
      });
      return request;
    } catch (error) {
      throw new Error(`Failed to create termination request: ${error.message}`);
    }
  }

  // Governor: Approve termination request
  static async approveTermination(terminationId, approvedBy) {
    try {
      const request = await prisma.terminationRequest.update({
        where: { id: terminationId },
        data: {
          status: 'Approved',
          approvedAt: new Date(),
          approvedBy,
        },
        include: { fund: true },
      });

      // Mark fund as Closed
      await prisma.pensionFund.update({
        where: { id: request.fundId },
        data: { status: 'Closed' },
      });

      return request;
    } catch (error) {
      throw new Error(`Failed to approve termination: ${error.message}`);
    }
  }

  // Governor: Reject termination request
  static async rejectTermination(terminationId, approvedBy) {
    try {
      const request = await prisma.terminationRequest.update({
        where: { id: terminationId },
        data: {
          status: 'Rejected',
          approvedAt: new Date(),
          approvedBy,
        },
      });
      return request;
    } catch (error) {
      throw new Error(`Failed to reject termination: ${error.message}`);
    }
  }

  // Get termination request history for a fund
  static async getTerminationHistory(fundId) {
    try {
      const requests = await prisma.terminationRequest.findMany({
        where: { fundId },
        orderBy: { createdAt: 'desc' },
      });
      return requests;
    } catch (error) {
      throw new Error(`Failed to fetch termination history: ${error.message}`);
    }
  }
}

export default TerminationService;
