import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WithdrawalService {
  // User: Request emergency withdrawal
  static async requestEmergencyWithdrawal(data) {
    try {
      const request = await prisma.emergencyWithdrawalRequest.create({
        data: {
          fundId: data.fundId,
          userId: data.userId,
          amount: data.amount,
          reason: data.reason,
          status: 'Pending',
        },
      });
      return request;
    } catch (error) {
      throw new Error(`Failed to create withdrawal request: ${error.message}`);
    }
  }

  // User: Get emergency withdrawal request history
  static async getEmergencyWithdrawalHistory(fundId) {
    try {
      const requests = await prisma.emergencyWithdrawalRequest.findMany({
        where: { fundId },
        orderBy: { createdAt: 'desc' },
      });
      return requests;
    } catch (error) {
      throw new Error(`Failed to fetch withdrawal history: ${error.message}`);
    }
  }

  // Governor: Get pending emergency withdrawal requests
  static async getPendingEmergencyRequests() {
    try {
      const requests = await prisma.emergencyWithdrawalRequest.findMany({
        where: { status: 'Pending' },
        include: {
          fund: { select: { id: true, name: true, corpus: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return requests;
    } catch (error) {
      throw new Error(`Failed to fetch pending requests: ${error.message}`);
    }
  }

  // Governor: Approve emergency withdrawal
  static async approveEmergencyWithdrawal(requestId, approvedBy) {
    try {
      const request = await prisma.emergencyWithdrawalRequest.update({
        where: { id: requestId },
        data: {
          status: 'Approved',
          approvedAt: new Date(),
          approvedBy,
        },
        include: { fund: true },
      });
      return request;
    } catch (error) {
      throw new Error(`Failed to approve withdrawal: ${error.message}`);
    }
  }

  // Governor: Reject emergency withdrawal
  static async rejectEmergencyWithdrawal(requestId, approvedBy) {
    try {
      const request = await prisma.emergencyWithdrawalRequest.update({
        where: { id: requestId },
        data: {
          status: 'Rejected',
          approvedAt: new Date(),
          approvedBy,
        },
        include: { fund: true },
      });
      return request;
    } catch (error) {
      throw new Error(`Failed to reject withdrawal: ${error.message}`);
    }
  }

  // Governor: Process approved withdrawal (mark as processed)
  static async processWithdrawal(requestId) {
    try {
      const request = await prisma.emergencyWithdrawalRequest.update({
        where: { id: requestId },
        data: { status: 'Processed' },
      });
      return request;
    } catch (error) {
      throw new Error(`Failed to process withdrawal: ${error.message}`);
    }
  }
}

export default WithdrawalService;
