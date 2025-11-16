"use client";

import { useRouter } from "next/navigation";

export default function UpcomingDoses({ activeReminders = [], isDarkMode }) {
  const router = useRouter();

  const styles = {
    section: {
      padding: "24px",
      borderRadius: "16px",
      border: "1px solid #e9ecef",
      backgroundColor: isDarkMode ? "#2d2d2d" : "#ffffff",
      borderColor: isDarkMode ? "#404040" : "#e9ecef",
      boxShadow: isDarkMode ? "none" : "0 2px 10px rgba(0,0,0,0.08)"
    },
    
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "20px"
    },
    
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: isDarkMode ? "#e9ecef" : "#374151",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      margin: 0
    },
    
    sectionIcon: {
      fontSize: "20px"
    },
    
    viewAllButton: {
      padding: "8px 16px",
      backgroundColor: "#10b981",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease"
    },

    remindersList: {
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    },
    
    reminderItem: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #e9ecef",
      backgroundColor: isDarkMode ? "#404040" : "#f8f9fa",
      borderColor: isDarkMode ? "#555555" : "#e9ecef",
      transition: "all 0.3s ease",
      cursor: "pointer"
    },
    
    reminderIcon: {
      fontSize: "24px",
      color: "#10b981",
      minWidth: "24px"
    },
    
    reminderContent: {
      flex: 1
    },
    
    reminderMedicine: {
      fontSize: "14px",
      fontWeight: "600",
      marginBottom: "4px",
      color: isDarkMode ? "#e9ecef" : "#374151"
    },
    
    reminderDose: {
      fontSize: "12px",
      color: "#6c757d"
    },
    
    reminderBadge: {
      fontSize: "16px"
    },

    emptyState: {
      textAlign: "center",
      padding: "40px 20px"
    },
    
    emptyIcon: {
      fontSize: "48px",
      display: "block",
      marginBottom: "16px"
    },
    
    emptyText: {
      fontSize: "14px",
      color: "#6c757d",
      marginBottom: "16px"
    },
    
    emptyButton: {
      padding: "10px 20px",
      backgroundColor: "#10b981",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease"
    },

    loadingState: {
      textAlign: "center",
      padding: "40px 20px",
      color: "#6c757d"
    },

    timeIndicator: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "11px",
      color: "#10b981",
      fontWeight: "600"
    },

    urgentBadge: {
      backgroundColor: "#ef4444",
      color: "white",
      padding: "2px 8px",
      borderRadius: "12px",
      fontSize: "10px",
      fontWeight: "600"
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = timestamp instanceof Date ? timestamp : 
                   (timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
      
      const now = new Date();
      const diffMs = date - now;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      // If in the past
      if (diffMs < 0) {
        return 'Overdue';
      }

      // If less than 1 hour away
      if (diffHours === 0) {
        if (diffMinutes <= 0) return 'Now';
        return `${diffMinutes}m`;
      }

      // If less than 24 hours away
      if (diffHours < 24) {
        return `${diffHours}h ${diffMinutes}m`;
      }

      // Otherwise show date and time
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const isUrgent = (nextDose) => {
    if (!nextDose) return false;
    const date = nextDose instanceof Date ? nextDose : 
                 (nextDose.toDate ? nextDose.toDate() : new Date(nextDose));
    const now = new Date();
    const diffHours = (date - now) / (1000 * 60 * 60);
    return diffHours < 1 && diffHours > 0; // Less than 1 hour away
  };

  // Loading state check
  if (activeReminders === undefined) {
    return (
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.sectionIcon}>⏰</span>
            Upcoming Doses
          </h2>
        </div>
        <div style={styles.loadingState}>
          <p>Loading reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>⏰</span>
          Upcoming Doses
          {activeReminders.length > 0 && (
            <span style={{ fontSize: '12px', color: '#6c757d', fontWeight: 'normal' }}>
              ({activeReminders.length})
            </span>
          )}
        </h2>
        <button 
          onClick={() => router.push('/reminders')}
          style={styles.viewAllButton}
        >
          Manage
        </button>
      </div>
      
      <div style={styles.remindersList}>
        {activeReminders.length > 0 ? (
          activeReminders.map((reminder, index) => (
            <div 
              key={reminder.id || index} 
              style={styles.reminderItem} 
              className="reminder-item"
              onClick={() => router.push('/reminders')}
            >
              <div style={styles.reminderIcon}>💊</div>
              <div style={styles.reminderContent}>
                <div style={styles.reminderMedicine}>
                  {reminder.medicineName || 'Unknown Medicine'}
                </div>
                <div style={styles.reminderDose}>
                  {reminder.dosage || 'No dosage'} 
                  {reminder.frequency && ` • ${reminder.frequency.replace('_', ' ')}`}
                </div>
                <div style={styles.timeIndicator}>
                  🕒 {formatDate(reminder.nextDose)}
                </div>
              </div>
              <div style={styles.reminderBadge}>
                {isUrgent(reminder.nextDose) ? (
                  <span style={styles.urgentBadge}>URGENT</span>
                ) : (
                  '⏰'
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>⏰</span>
            <p style={styles.emptyText}>No upcoming doses scheduled</p>
            <button 
              onClick={() => router.push('/reminders')}
              style={styles.emptyButton}
            >
              Set Reminders
            </button>
          </div>
        )}
      </div>
    </div>
  );
}