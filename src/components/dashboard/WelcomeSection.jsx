"use client";

export default function WelcomeSection({ user, isAdmin, isDarkMode }) {
  const styles = {
    welcomeSection: {
      textAlign: "center",
      marginBottom: "40px"
    },
    
    welcomeTitle: {
      fontSize: "clamp(24px, 4vw, 36px)",
      fontWeight: "700",
      color: "#10b981",
      marginBottom: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      flexWrap: "wrap"
    },
    
    adminBadge: {
      fontSize: "14px",
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      color: "white",
      padding: "4px 12px",
      borderRadius: "20px",
      fontWeight: "600"
    },
    
    welcomeSubtitle: {
      fontSize: "16px",
      color: isDarkMode ? "#e9ecef" : "#6c757d",
      fontWeight: "400"
    }
  };

  return (
    <div style={styles.welcomeSection}>
      <h1 style={styles.welcomeTitle}>
        Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'User'}! 👋
        {isAdmin && <span style={styles.adminBadge}>Admin</span>}
      </h1>
      <p style={styles.welcomeSubtitle}>
        Here's your health overview for today
      </p>
    </div>
  );
}