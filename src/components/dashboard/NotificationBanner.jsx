"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function NotificationBanner({ isDarkMode }) {
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    
    // Load user's notification preference from database
    if (user && !loading) {
      loadNotificationPreference();
    }
  }, [user, loading]);

  const loadNotificationPreference = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // If user has notifications enabled in database and browser permission is granted
        if (userData.notificationSettings?.enabled === true && Notification.permission === 'granted') {
          setNotificationPermission('granted');
        }
        
        // If user previously dismissed the banner
        if (userData.notificationSettings?.dismissed === true) {
          setDismissed(true);
        }
      }
    } catch (error) {
      console.error("Error loading notification preference:", error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && user) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // Save to database - USER OPTED IN
        await saveNotificationPreference(true);
        
        showNotification('Notifications enabled! You\'ll receive important medicine alerts.', 'success');
        
        // Show welcome notification
        setTimeout(() => {
          new Notification('Medicine Checker', {
            body: 'Notifications are now enabled for important medicine alerts!',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'welcome'
          });
        }, 1000);
        
      } else {
        // Save denial to database - USER OPTED OUT
        await saveNotificationPreference(false);
        showNotification('Notifications denied. You can enable them later in your profile settings.', 'error');
      }
    }
  };

  const dismissBanner = async () => {
    setDismissed(true);
    
    // Save dismissal to database
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          'notificationSettings.dismissed': true,
          'notificationSettings.dismissedAt': new Date(),
          updatedAt: new Date()
        });
      } catch (error) {
        console.error("Error saving banner dismissal:", error);
      }
    }
  };

  const saveNotificationPreference = async (enabled) => {
    if (!user) return;
    
    try {
      const notificationSettings = {
        enabled: enabled,
        browserPermission: Notification.permission,
        enabledAt: enabled ? new Date() : null,
        disabledAt: !enabled ? new Date() : null,
        dismissed: false, // Reset dismissal when user takes action
        types: {
          medicineReminders: enabled,
          drugRecalls: enabled,
          drugInteractions: enabled,
          adminAlerts: enabled,
          doseReminders: enabled,
          searchUpdates: enabled // New type for search notifications
        },
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      // Update user document
      await updateDoc(doc(db, "users", user.uid), {
        notificationSettings: notificationSettings,
        isNotificationEnabled: enabled, // Easy query field
        updatedAt: new Date()
      });
      
      console.log(`✅ Notification preference saved: ${enabled ? 'ENABLED' : 'DISABLED'}`);
      
      // Save to notification subscribers collection for easy querying
      if (enabled) {
        await setDoc(doc(db, "notificationSubscribers", user.uid), {
          userId: user.uid,
          email: user.email,
          displayName: user.displayName || 'Anonymous',
          subscribedAt: new Date(),
          active: true,
          settings: notificationSettings,
          lastSeen: new Date()
        });
      } else {
        // Mark as inactive but keep record
        await setDoc(doc(db, "notificationSubscribers", user.uid), {
          userId: user.uid,
          email: user.email,
          displayName: user.displayName || 'Anonymous',
          subscribedAt: null,
          unsubscribedAt: new Date(),
          active: false,
          settings: notificationSettings
        });
      }
      
    } catch (error) {
      console.error("Error saving notification preference:", error);
      showNotification('Error saving notification preference. Please try again.', 'error');
    }
  };

  const showNotification = (message, type) => {
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      max-width: 400px;
      word-wrap: break-word;
      font-family: 'Poppins', sans-serif;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  };

  const styles = {
    notificationBanner: {
      maxWidth: "1200px",
      margin: "0 auto 30px",
      padding: "20px",
      borderRadius: "12px",
      background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      color: "white",
      position: "relative"
    },

    dismissButton: {
      position: "absolute",
      top: "10px",
      right: "10px",
      backgroundColor: "rgba(255,255,255,0.2)",
      border: "none",
      color: "white",
      borderRadius: "50%",
      width: "30px",
      height: "30px",
      cursor: "pointer",
      fontSize: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },

    notificationContent: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      paddingRight: "40px"
    },

    notificationIcon: {
      fontSize: "24px"
    },

    notificationTitle: {
      fontSize: "16px",
      fontWeight: "600",
      margin: "0 0 4px 0"
    },

    notificationText: {
      fontSize: "14px",
      margin: 0,
      opacity: 0.9
    },

    notificationButton: {
      padding: "10px 20px",
      backgroundColor: "rgba(255,255,255,0.2)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.3)",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginLeft: "auto"
    }
  };

  // Don't show banner if permission already granted, user not loaded, or dismissed
  if (notificationPermission === 'granted' || loading || !user || dismissed) {
    return null;
  }

  return (
    <div style={styles.notificationBanner}>
      <button 
        onClick={dismissBanner}
        style={styles.dismissButton}
        title="Dismiss"
      >
        ✕
      </button>
      
      <div style={styles.notificationContent}>
        <span style={styles.notificationIcon}>🔔</span>
        <div>
          <h4 style={styles.notificationTitle}>Enable Notifications</h4>
          <p style={styles.notificationText}>
            Get important alerts about medicine recalls, interactions, reminders, and search updates
          </p>
        </div>
        <button 
          onClick={requestNotificationPermission}
          style={styles.notificationButton}
          className="notification-button"
        >
          Enable
        </button>
      </div>
    </div>
  );
}