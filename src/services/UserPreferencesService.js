import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserPreferencesService {
  // Get user preferences
  static async getUserPreferences(userId) {
    try {
      let preferences = await prisma.userPreferences.findUnique({
        where: { userId },
      });

      // Create default preferences if they don't exist
      if (!preferences) {
        preferences = await prisma.userPreferences.create({
          data: {
            userId,
            emailNotifications: true,
            pushNotifications: true,
            theme: 'light',
            language: 'en',
          },
        });
      }

      return preferences;
    } catch (error) {
      throw new Error(`Failed to fetch user preferences: ${error.message}`);
    }
  }

  // Update user preferences
  static async updateUserPreferences(userId, data) {
    try {
      let preferences = await prisma.userPreferences.findUnique({
        where: { userId },
      });

      if (!preferences) {
        preferences = await prisma.userPreferences.create({
          data: {
            userId,
            ...data,
          },
        });
      } else {
        preferences = await prisma.userPreferences.update({
          where: { userId },
          data,
        });
      }

      return preferences;
    } catch (error) {
      throw new Error(`Failed to update user preferences: ${error.message}`);
    }
  }

  // Update theme preference
  static async updateTheme(userId, theme) {
    try {
      const preferences = await this.updateUserPreferences(userId, { theme });
      return preferences;
    } catch (error) {
      throw new Error(`Failed to update theme: ${error.message}`);
    }
  }

  // Update language preference
  static async updateLanguage(userId, language) {
    try {
      const preferences = await this.updateUserPreferences(userId, { language });
      return preferences;
    } catch (error) {
      throw new Error(`Failed to update language: ${error.message}`);
    }
  }

  // Toggle email notifications
  static async toggleEmailNotifications(userId) {
    try {
      const current = await this.getUserPreferences(userId);
      const preferences = await this.updateUserPreferences(userId, {
        emailNotifications: !current.emailNotifications,
      });
      return preferences;
    } catch (error) {
      throw new Error(`Failed to toggle email notifications: ${error.message}`);
    }
  }

  // Toggle push notifications
  static async togglePushNotifications(userId) {
    try {
      const current = await this.getUserPreferences(userId);
      const preferences = await this.updateUserPreferences(userId, {
        pushNotifications: !current.pushNotifications,
      });
      return preferences;
    } catch (error) {
      throw new Error(`Failed to toggle push notifications: ${error.message}`);
    }
  }
}

export default UserPreferencesService;
