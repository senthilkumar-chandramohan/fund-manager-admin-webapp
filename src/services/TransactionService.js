import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TransactionService {
  // Get transaction history for a pension fund
  static async getTransactionHistory(fundId, limit = 50, offset = 0) {
    try {
      const transactions = await prisma.transaction.findMany({
        where: { fundId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      const total = await prisma.transaction.count({ where: { fundId } });

      return { transactions, total, page: Math.ceil(offset / limit) + 1 };
    } catch (error) {
      throw new Error(`Failed to fetch transaction history: ${error.message}`);
    }
  }

  // Create a new transaction
  static async createTransaction(data) {
    try {
      const transaction = await prisma.transaction.create({
        data: {
          fundId: data.fundId,
          type: data.type,
          amount: data.amount,
          txHash: data.txHash,
          status: data.status || 'Pending',
        },
      });
      return transaction;
    } catch (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  // Update transaction status (e.g., when confirmed on blockchain)
  static async updateTransactionStatus(transactionId, status) {
    try {
      const transaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: { status },
      });
      return transaction;
    } catch (error) {
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
  }

  // Get transaction by hash
  static async getTransactionByHash(txHash) {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { txHash },
      });
      return transaction;
    } catch (error) {
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }
  }
}

export default TransactionService;
