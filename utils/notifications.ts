import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

export async function createNotification(userId: string, type: NotificationType, message: string) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
      },
    });

    // In a real-world scenario, you might want to emit this notification to the user in real-time
    // using WebSockets or Server-Sent Events
    console.log(`Created notification for user ${userId}: ${message}`);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}