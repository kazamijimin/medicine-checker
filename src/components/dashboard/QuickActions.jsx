"use client";

import { useRouter } from "next/navigation";

export default function QuickActions({ isAdmin, isDarkMode }) {
  const router = useRouter();

  const styles = {
    quickActions: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "24px",
      borderRadius: "16px",
      border: "1px solid #e9ecef",
      backgroundColor: isDarkMode ? "#2d2d2d" : "#f8f9fa",
      borderColor: isDarkMode ? "#404040" : "#e9ecef"
    },
    
    quickActionsTitle: {
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "20px",
      color: isDarkMode ? "#e9ecef" : "#374151"
    },
    
    actionGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "16px"
    },
    
    actionCard: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
      padding: "20px",
      border: "2px solid #e9ecef",
      borderRadius: "12px",
      backgroundColor: "transparent",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textDecoration: "none",
      borderColor: isDarkMode ? "#555555" : "#e9ecef",
      color: isDarkMode ? "#e9ecef" : "#374151"
    },

    adminActionCard: {
      borderColor: "#ef4444",
      backgroundColor: "rgba(239, 68, 68, 0.05)"
    },
    
    actionIcon: {
      fontSize: "24px"
    },
    
    actionLabel: {
      fontSize: "12px",
      fontWeight: "600",
      textAlign: "center"
    }
  };

  const actions = [
    { icon: "🔍", label: "Search Medicine", path: "/" },
    { icon: "⏰", label: "Set Reminder", path: "/reminders" },
    { icon: "📋", label: "View History", path: "/history" },
    { icon: "🏥", label: "Find Pharmacy", path: "/pharmacy-locator" }
  ];

  if (isAdmin) {
    actions.push({ icon: "⚙️", label: "Admin Panel", path: "/admin", isAdmin: true });
  }

  return (
    <div style={styles.quickActions}>
      <h3 style={styles.quickActionsTitle}>Quick Actions</h3>
      <div style={styles.actionGrid}>
        {actions.map((action, index) => (
          <button 
            key={index}
            onClick={() => router.push(action.path)}
            style={{
              ...styles.actionCard,
              ...(action.isAdmin ? styles.adminActionCard : {})
            }}
            className="action-card"
          >
            <div style={styles.actionIcon}>{action.icon}</div>
            <div style={styles.actionLabel}>{action.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}