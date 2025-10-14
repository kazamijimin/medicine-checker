"use client";

import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  doc, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';

const NotificationSystem = ({ user, isDarkMode }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Listen for user-specific notifications
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', 'in', [user.uid, 'all']), // 'all' for global notifications
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const notification of unreadNotifications) {
        await updateDoc(doc(db, 'notifications', notification.id), {
          read: true
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const currentStyles = isDarkMode ? darkNotificationStyles : lightNotificationStyles;

  return (
    <div style={currentStyles.container}>
      {/* Notification Bell */}
      <div 
        style={currentStyles.bellContainer}
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <div style={currentStyles.bell}>
          🔔
        </div>
        {unreadCount > 0 && (
          <div style={currentStyles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div style={currentStyles.dropdown}>
          <div style={currentStyles.header}>
            <h3 style={currentStyles.title}>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                style={currentStyles.markAllButton}
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div style={currentStyles.notificationList}>
            {notifications.length === 0 ? (
              <div style={currentStyles.emptyState}>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  style={{
                    ...currentStyles.notificationItem,
                    ...(notification.read ? {} : currentStyles.unreadItem)
                  }}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div style={currentStyles.notificationContent}>
                    <h4 style={currentStyles.notificationTitle}>
                      {notification.title}
                    </h4>
                    <p style={currentStyles.notificationMessage}>
                      {notification.message}
                    </p>
                    <span style={currentStyles.notificationTime}>
                      {notification.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  {!notification.read && (
                    <div style={currentStyles.unreadDot}></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Admin Notification Panel Component
export const AdminNotificationPanel = ({ isDarkMode }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('all'); // 'all' or 'specific'
  const [targetUsers, setTargetUsers] = useState('');
  const [sending, setSending] = useState(false);

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Please fill in both title and message');
      return;
    }

    setSending(true);
    try {
      const notificationData = {
        title: title.trim(),
        message: message.trim(),
        createdAt: serverTimestamp(),
        read: false,
        type: 'system_update'
      };

      if (targetType === 'all') {
        // Send to all users
        await addDoc(collection(db, 'notifications'), {
          ...notificationData,
          userId: 'all'
        });
      } else {
        // Send to specific users
        const userIds = targetUsers.split(',').map(id => id.trim()).filter(id => id);
        for (const userId of userIds) {
          await addDoc(collection(db, 'notifications'), {
            ...notificationData,
            userId
          });
        }
      }

      // Reset form
      setTitle('');
      setMessage('');
      setTargetUsers('');
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification');
    } finally {
      setSending(false);
    }
  };

  const currentStyles = isDarkMode ? darkAdminStyles : lightAdminStyles;

  return (
    <div style={currentStyles.container}>
      <h2 style={currentStyles.title}>Send Notification</h2>
      
      <div style={currentStyles.form}>
        <div style={currentStyles.field}>
          <label style={currentStyles.label}>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={currentStyles.input}
            placeholder="Notification title"
          />
        </div>

        <div style={currentStyles.field}>
          <label style={currentStyles.label}>Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={currentStyles.textarea}
            placeholder="Notification message"
            rows="4"
          />
        </div>

        <div style={currentStyles.field}>
          <label style={currentStyles.label}>Target:</label>
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
            style={currentStyles.select}
          >
            <option value="all">All Users</option>
            <option value="specific">Specific Users</option>
          </select>
        </div>

        {targetType === 'specific' && (
          <div style={currentStyles.field}>
            <label style={currentStyles.label}>User IDs (comma-separated):</label>
            <input
              type="text"
              value={targetUsers}
              onChange={(e) => setTargetUsers(e.target.value)}
              style={currentStyles.input}
              placeholder="user1@example.com, user2@example.com"
            />
          </div>
        )}

        <button
          onClick={sendNotification}
          disabled={sending}
          style={{
            ...currentStyles.sendButton,
            ...(sending ? currentStyles.sendButtonDisabled : {})
          }}
        >
          {sending ? 'Sending...' : 'Send Notification'}
        </button>
      </div>
    </div>
  );
};

// Light theme styles for notifications
const lightNotificationStyles = {
  container: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
  },
  bellContainer: {
    position: 'relative',
    cursor: 'pointer',
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef',
  },
  bell: {
    fontSize: '24px',
  },
  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#dc3545',
    color: 'white',
    borderRadius: '10px',
    padding: '2px 6px',
    fontSize: '12px',
    fontWeight: 'bold',
    minWidth: '20px',
    textAlign: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: '60px',
    right: '0',
    width: '350px',
    maxHeight: '400px',
    backgroundColor: '#fff',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },
  header: {
    padding: '15px',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
  },
  markAllButton: {
    background: 'none',
    border: 'none',
    color: '#28a745',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  notificationList: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
  notificationItem: {
    padding: '15px',
    borderBottom: '1px solid #f8f9fa',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    transition: 'background-color 0.2s',
  },
  unreadItem: {
    backgroundColor: '#f8f9fa',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    margin: '0 0 5px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  notificationMessage: {
    margin: '0 0 5px 0',
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.4',
  },
  notificationTime: {
    fontSize: '12px',
    color: '#999',
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#28a745',
    borderRadius: '50%',
    marginTop: '3px',
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#999',
  },
};

// Dark theme styles for notifications
const darkNotificationStyles = {
  ...lightNotificationStyles,
  bellContainer: {
    ...lightNotificationStyles.bellContainer,
    backgroundColor: '#2d2d2d',
    border: '1px solid #404040',
  },
  dropdown: {
    ...lightNotificationStyles.dropdown,
    backgroundColor: '#2d2d2d',
    border: '1px solid #404040',
  },
  header: {
    ...lightNotificationStyles.header,
    borderBottom: '1px solid #404040',
  },
  title: {
    ...lightNotificationStyles.title,
    color: '#fff',
  },
  notificationItem: {
    ...lightNotificationStyles.notificationItem,
    borderBottom: '1px solid #404040',
  },
  unreadItem: {
    backgroundColor: '#404040',
  },
  notificationTitle: {
    ...lightNotificationStyles.notificationTitle,
    color: '#fff',
  },
  notificationMessage: {
    ...lightNotificationStyles.notificationMessage,
    color: '#ccc',
  },
  notificationTime: {
    ...lightNotificationStyles.notificationTime,
    color: '#999',
  },
  emptyState: {
    ...lightNotificationStyles.emptyState,
    color: '#ccc',
  },
};

// Admin panel styles
const lightAdminStyles = {
  container: {
    maxWidth: '600px',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  title: {
    color: '#333',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  textarea: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    resize: 'vertical',
  },
  select: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  sendButton: {
    padding: '12px 24px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  sendButtonDisabled: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed',
  },
};

const darkAdminStyles = {
  ...lightAdminStyles,
  container: {
    ...lightAdminStyles.container,
    backgroundColor: '#2d2d2d',
  },
  title: {
    ...lightAdminStyles.title,
    color: '#fff',
  },
  label: {
    ...lightAdminStyles.label,
    color: '#fff',
  },
  input: {
    ...lightAdminStyles.input,
    backgroundColor: '#404040',
    border: '1px solid #555',
    color: '#fff',
  },
  textarea: {
    ...lightAdminStyles.textarea,
    backgroundColor: '#404040',
    border: '1px solid #555',
    color: '#fff',
  },
  select: {
    ...lightAdminStyles.select,
    backgroundColor: '#404040',
    border: '1px solid #555',
    color: '#fff',
  },
};

export default NotificationSystem;