import { collection, query, where, orderBy, limit, getDocs, addDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

export class NotificationService {
  
  // Get all users who have notifications enabled - USES INDEX
  static async getNotificationEnabledUsers() {
    try {
      const usersQuery = query(
        collection(db, "users"),
        where("isNotificationEnabled", "==", true)
      );
      
      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting notification-enabled users:", error);
      return [];
    }
  }

  // Get active notification subscribers - USES INDEX
  static async getActiveSubscribers() {
    try {
      const subscribersQuery = query(
        collection(db, "notificationSubscribers"),
        where("active", "==", true),
        orderBy("subscribedAt", "desc")
      );
      
      const snapshot = await getDocs(subscribersQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting active subscribers:", error);
      return [];
    }
  }

  // Get user's notifications - USES INDEX
  static async getUserNotifications(userId, unreadOnly = false) {
    try {
      let notificationsQuery;
      
      if (unreadOnly) {
        notificationsQuery = query(
          collection(db, "notifications"),
          where("userId", "==", userId),
          where("read", "==", false),
          orderBy("sentAt", "desc"),
          limit(20)
        );
      } else {
        notificationsQuery = query(
          collection(db, "notifications"),
          where("userId", "==", userId),
          orderBy("sentAt", "desc"),
          limit(50)
        );
      }
      
      const snapshot = await getDocs(notificationsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting user notifications:", error);
      return [];
    }
  }

  // Get notifications by type - USES INDEX
  static async getNotificationsByType(type, limitCount = 100) {
    try {
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("type", "==", type),
        orderBy("sentAt", "desc"),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(notificationsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting notifications by type:", error);
      return [];
    }
  }

  // Send notification to specific users
  static async sendNotificationToUsers(userIds, notificationData) {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        title: notificationData.title,
        body: notificationData.body,
        type: notificationData.type,
        data: notificationData.data || {},
        sentAt: new Date(),
        read: false,
        delivered: false
      }));

      // Save notifications to database
      const promises = notifications.map(notification => 
        addDoc(collection(db, "notifications"), notification)
      );

      await Promise.all(promises);
      
      console.log(`✅ Sent notifications to ${userIds.length} users`);
      return true;
    } catch (error) {
      console.error("Error sending notifications:", error);
      return false;
    }
  }

  // Send notification to ALL users with notifications enabled
  static async sendBroadcastNotification(notificationData) {
    try {
      const enabledUsers = await this.getNotificationEnabledUsers();
      const userIds = enabledUsers.map(user => user.id);
      
      if (userIds.length === 0) {
        console.log("No users have notifications enabled");
        return false;
      }

      return await this.sendNotificationToUsers(userIds, notificationData);
    } catch (error) {
      console.error("Error sending broadcast notification:", error);
      return false;
    }
  }

  // Get notification statistics
  static async getNotificationStats() {
    try {
      const enabledUsers = await this.getNotificationEnabledUsers();
      const activeSubscribers = await this.getActiveSubscribers();
      
      const totalUsersQuery = await getDocs(collection(db, "users"));
      const totalUsers = totalUsersQuery.docs.length;
      
      const notificationsQuery = await getDocs(collection(db, "notifications"));
      const totalNotifications = notificationsQuery.docs.length;
      
      return {
        totalUsers,
        enabledUsers: enabledUsers.length,
        activeSubscribers: activeSubscribers.length,
        enabledPercentage: totalUsers > 0 ? ((enabledUsers.length / totalUsers) * 100).toFixed(1) : 0,
        totalNotificationsSent: totalNotifications
      };
    } catch (error) {
      console.error("Error getting notification stats:", error);
      return null;
    }
  }
}