import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WorkflowService {
  // Admin: Create workflow for pension fund (n8n integration)
  static async createWorkflow(data) {
    try {
      const workflow = await prisma.workflow.create({
        data: {
          fundId: data.fundId,
          type: data.type,
          n8nWorkflowId: data.n8nWorkflowId,
          status: 'Running',
          nextRun: data.nextRun ? new Date(data.nextRun) : null,
        },
      });
      return workflow;
    } catch (error) {
      throw new Error(`Failed to create workflow: ${error.message}`);
    }
  }

  // Get all workflows for a fund
  static async getWorkflowsByFund(fundId) {
    try {
      const workflows = await prisma.workflow.findMany({
        where: { fundId },
        orderBy: { lastRun: 'desc' },
      });
      return workflows;
    } catch (error) {
      throw new Error(`Failed to fetch workflows: ${error.message}`);
    }
  }

  // Get all active workflows
  static async getActiveWorkflows() {
    try {
      const workflows = await prisma.workflow.findMany({
        where: { status: { in: ['Running', 'Paused'] } },
        include: { fund: { select: { id: true, name: true } } },
        orderBy: { lastRun: 'desc' },
      });
      return workflows;
    } catch (error) {
      throw new Error(`Failed to fetch active workflows: ${error.message}`);
    }
  }

  // Update workflow status
  static async updateWorkflowStatus(workflowId, status, lastRun = new Date()) {
    try {
      const workflow = await prisma.workflow.update({
        where: { id: workflowId },
        data: { status, lastRun },
      });
      return workflow;
    } catch (error) {
      throw new Error(`Failed to update workflow: ${error.message}`);
    }
  }

  // Schedule next workflow run
  static async scheduleNextRun(workflowId, nextRun) {
    try {
      const workflow = await prisma.workflow.update({
        where: { id: workflowId },
        data: { nextRun: new Date(nextRun) },
      });
      return workflow;
    } catch (error) {
      throw new Error(`Failed to schedule workflow: ${error.message}`);
    }
  }
}

export default WorkflowService;
