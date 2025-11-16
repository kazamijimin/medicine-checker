"use client";

export default function StatsGrid({ healthStats, isDarkMode }) {
  const styles = {
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      maxWidth: "1200px",
      margin: "0 auto 40px",
      padding: "0 20px"
    },
    
    statCard: {
      padding: "24px",
      borderRadius: "16px",
      background: isDarkMode 
        ? "linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)" 
        : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
      border: "1px solid",
      borderColor: isDarkMode ? "#404040" : "#e9ecef",
      textAlign: "center",
      transition: "all 0.3s ease",
      cursor: "default",
      boxShadow: isDarkMode ? "none" : "0 2px 10px rgba(0,0,0,0.05)"
    },
    
    statIcon: {
      fontSize: "32px",
      marginBottom: "12px",
      display: "block"
    },
    
    statValue: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#10b981",
      marginBottom: "4px"
    },
    
    statLabel: {
      fontSize: "14px",
      opacity: 0.9,
      fontWeight: "500",
      color: isDarkMode ? "#e9ecef" : "#374151"
    }
  };

  const stats = [
    { 
      icon: "🔍", 
      value: healthStats?.totalSearches || 0, 
      label: "Total Searches" 
    },
    { 
      icon: "💊", 
      value: healthStats?.activeMedicines || 0, 
      label: "Active Medicines" 
    },
    { 
      icon: "⏰", 
      value: healthStats?.upcomingDoses || 0, 
      label: "Upcoming Doses" 
    },
    { 
      icon: "⚠️", 
      value: healthStats?.interactions || 0, 
      label: "Interactions" 
    }
  ];

  return (
    <div style={styles.statsGrid}>
      {stats.map((stat, index) => (
        <div key={index} style={styles.statCard}>
          <div style={styles.statIcon}>{stat.icon}</div>
          <div style={styles.statValue}>{stat.value}</div>
          <div style={styles.statLabel}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}