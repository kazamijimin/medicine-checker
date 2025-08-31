"use client";

import { useRouter } from "next/navigation";

export default function AdminPanel({ isDarkMode }) {
  const router = useRouter();

  const styles = {
    adminPanel: {
      maxWidth: "1200px",
      margin: "0 auto 40px",
      padding: "24px",
      borderRadius: "16px",
      border: "2px solid #ef4444",
      background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))"
    },

    adminHeader: {
      marginBottom: "20px"
    },

    adminTitle: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#ef4444",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      margin: 0
    },

    adminIcon: {
      fontSize: "24px"
    },

    adminGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px"
    },

    adminCard: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
      padding: "20px",
      border: "2px solid #ef4444",
      borderRadius: "12px",
      backgroundColor: "rgba(239, 68, 68, 0.05)",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textDecoration: "none",
      color: "inherit"
    },

    adminCardIcon: {
      fontSize: "28px"
    },

    adminCardLabel: {
      fontSize: "14px",
      fontWeight: "600",
      textAlign: "center",
      color: "#ef4444"
    },

    adminCardCount: {
      fontSize: "12px",
      color: "#6c757d"
    }
  };

  const adminActions = [
    { icon: "💊", label: "Manage Medicines", count: "1,247 entries", path: "/admin/medicines" },
    { icon: "👥", label: "User Management", count: "523 users", path: "/admin/users" },
    { icon: "⚠️", label: "Send Alerts", count: "12 pending", path: "/admin/alerts" },
    { icon: "📊", label: "Analytics", count: "View reports", path: "/admin/analytics" }
  ];

  return (
    <div style={styles.adminPanel}>
      <div style={styles.adminHeader}>
        <h2 style={styles.adminTitle}>
          <span style={styles.adminIcon}>⚙️</span>
          Admin Panel
        </h2>
      </div>
      <div style={styles.adminGrid}>
        {adminActions.map((action, index) => (
          <button 
            key={index}
            onClick={() => router.push(action.path)}
            style={styles.adminCard}
            className="admin-card"
          >
            <div style={styles.adminCardIcon}>{action.icon}</div>
            <div style={styles.adminCardLabel}>{action.label}</div>
            <div style={styles.adminCardCount}>{action.count}</div>
          </button>
        ))}
      </div>
    </div>
  );
}