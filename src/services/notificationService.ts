import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  writeBatch,
  limit,
  Timestamp
} from 'firebase/firestore';
import { Notification } from '@/types/firebase';
import { v4 as uuidv4 } from 'uuid';
import logger from '@/utils/logger';

/**
 * Create a new notification
 * @param notification The notification data
 * @returns The created notification ID
 */
export const createNotification = async (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>): Promise<string> => {
  try {
    const notificationId = uuidv4();
    
    const notificationData: Notification = {
      id: notificationId,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: false,
      timestamp: Date.now(),
      link: notification.link,
      proposalId: notification.proposalId
    };
    
    await addDoc(collection(db, 'notifications'), notificationData);
    
    logger.debug('Created notification:', { 
      id: notificationId, 
      userId: notification.userId,
      type: notification.type  
    });
    
    return notificationId;
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get user notifications
 * @param userId The user's address
 * @param options Query options (limit, types)
 * @returns An array of notifications
 */
export const getUserNotifications = async (
  userId: string, 
  options: { limit?: number; types?: string[]; unreadOnly?: boolean } = {}
): Promise<Notification[]> => {
  try {
    logger.debug('Getting notifications for user:', userId);
    
    const notificationsRef = collection(db, 'notifications');
    let notificationsQuery = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    // Apply additional filters if provided
    if (options.types && options.types.length > 0) {
      notificationsQuery = query(
        notificationsQuery,
        where('type', 'in', options.types)
      );
    }
    
    if (options.unreadOnly) {
      notificationsQuery = query(
        notificationsQuery,
        where('read', '==', false)
      );
    }
    
    if (options.limit) {
      notificationsQuery = query(
        notificationsQuery,
        limit(options.limit)
      );
    }
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    const notifications: Notification[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Notification;
      notifications.push({
        ...data,
        id: doc.id
      });
    });
    
    logger.debug(`Found ${notifications.length} notifications for user ${userId}`);
    return notifications;
  } catch (error) {
    logger.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param notificationId The notification ID
 * @returns Whether the operation was successful
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    logger.debug('Marking notification as read:', notificationId);
    
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
    
    return true;
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Mark all notifications as read for a user
 * @param userId The user's address
 * @returns The number of notifications marked as read
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<number> => {
  try {
    logger.debug('Marking all notifications as read for user:', userId);
    
    const notificationsRef = collection(db, 'notifications');
    const unreadQuery = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(unreadQuery);
    
    if (querySnapshot.empty) {
      logger.debug('No unread notifications found for user:', userId);
      return 0;
    }
    
    const batch = writeBatch(db);
    
    querySnapshot.forEach((document) => {
      batch.update(document.ref, { read: true });
    });
    
    await batch.commit();
    
    const count = querySnapshot.size;
    logger.debug(`Marked ${count} notifications as read for user ${userId}`);
    return count;
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Count unread notifications for a user
 * @param userId The user's address
 * @returns The count of unread notifications
 */
export const countUnreadNotifications = async (userId: string): Promise<number> => {
  try {
    logger.debug('Counting unread notifications for user:', userId);
    
    const notificationsRef = collection(db, 'notifications');
    const unreadQuery = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(unreadQuery);
    
    return querySnapshot.size;
  } catch (error) {
    logger.error('Error counting unread notifications:', error);
    throw error;
  }
}; 