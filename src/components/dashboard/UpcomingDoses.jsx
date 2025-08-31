"use client";

import { useRouter } from "next/navigation";

export default function UpcomingDoses({ activeReminders, isDarkMode }) {
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
      transition: "all 0.3s ease"
    },
    
    reminderIcon: {
      fontSize: "16px",
      color: "#10b981"
    },
    
    reminderContent: {
      flex: 1
    },
    
    reminderMedicine: {
      fontSize: "14px",
      fontWeight: "600",
      marginBottom: "2px",
      color: isDarkMode ? "#e9ecef" : "inherit"
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
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>⏰</span>
          Upcoming Doses
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
            <div key={index} style={styles.reminderItem} className="reminder-item">
              <div style={styles.reminderIcon}>💊</div>
              <div style={styles.reminderContent}>
                <div style={styles.reminderMedicine}>
                  {reminder.medicineName}
                </div>
                <div style={styles.reminderDose}>
                  {reminder.dosage} - {formatDate(reminder.nextDose)}
                </div>
              </div>
              <div style={styles.reminderBadge}>
                {reminder.urgent ? '🚨' : '⏰'}
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>⏰</span>
            <p style={styles.emptyText}>No upcoming doses</p>
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