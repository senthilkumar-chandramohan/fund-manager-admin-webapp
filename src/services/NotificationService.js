import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {
  // Get admin user notifications
  static async getUserNotifications(userId, limit = 20, offset = 0) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      const total = await prisma.notification.count({ where: { userId } });
      const unread = await prisma.notification.count({
        where: { userId, read: false },
      });

      return { notifications, total, unread, page: Math.ceil(offset / limit) + 1 };
    } catch (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
  }

  // Create notification
  static async createNotification(data) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          read: false,
        },
      });
      return notification;
    } catch (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
      return notification;
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId) {
    try {
      const result = await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  }

  // Delete notification
  static async deleteNotification(notificationId) {
    try {
      const notification = await prisma.notification.delete({
        where: { id: notificationId },
      });
      return notification;
    } catch (error) {
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }
}

export default NotificationService;
