"use client";

export default function StatsGrid({ healthStats, isDarkMode }) {
  const styles = {
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      marginBottom: "40px",
      maxWidth: "1200px",
      margin: "0 auto 40px"
    },
    
    statCard: {
      padding: "24px",
      borderRadius: "16px",
      border: "1px solid #e9ecef",
      textAlign: "center",
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "white",
      boxShadow: "0 4px 20px rgba(16, 185, 129, 0.2)"
    },
    
    statIcon: {
      fontSize: "32px",
      marginBottom: "12px"
    },
    
    statValue: {
      fontSize: "28px",
      fontWeight: "700",
      marginBottom: "4px"
    },
    
    statLabel: {
      fontSize: "14px",
      opacity: 0.9,
      fontWeight: "500"
    }
  };

  const stats = [
    { icon: "🔍", value: healthStats.totalSearches, label: "Total Searches" },
    { icon: "💊", value: healthStats.activeMedicines, label: "Active Medicines" },
    { icon: "⏰", value: healthStats.upcomingDoses, label: "Upcoming Doses" },
    { icon: "⚠️", value: healthStats.interactions, label: "Interactions" }
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